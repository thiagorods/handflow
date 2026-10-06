# SLT — Sign Language Translator (HandFlow)

Tradutor de sinais em tempo real. A webcam captura a mão, o MediaPipe extrai 21 pontos (landmarks), um classificador Random Forest reconhece a letra e o texto vai sendo montado na tela.

```
Câmera → HandDetector (MediaPipe) → SignRecognizer (Random Forest) → TextBuilder → tela
```

## Requisitos

- **Python 3.11 ou superior** (testado com 3.12)
- Uma webcam
- Internet apenas na primeira execução (o modelo `hand_landmarker.task` do MediaPipe, ~8 MB, é baixado sozinho)

## Instalação

Na pasta do projeto:

**Linux / macOS**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows (PowerShell)**

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> Em Ubuntu/Debian mínimos, se aparecer `libGL.so.1: cannot open shared object file`, instale: `sudo apt install libgl1`.

## Rodando o tradutor

```bash
python main.py
```

Uma janela abre com a imagem da câmera. Mostre uma letra com a mão e mantenha o sinal por cerca de meio segundo até ela aparecer no rodapé.

| Tecla | Ação |
|---|---|
| `Backspace` | apaga a última letra |
| `C` | limpa todo o texto |
| `Q` | sai |

**Para digitar a mesma letra duas vezes seguidas** (ex.: "LL"), abaixe a mão por cerca de um segundo entre as letras. Se o sinal ficar parado, a letra é digitada só uma vez, de propósito.

O arquivo `models/sign_classifier.pkl` já acompanha o projeto. Se ele não existir (por exemplo, após clonar do Git, pois `models/` está no `.gitignore`), gere-o seguindo a seção de treino abaixo.

## Criando ou ampliando o dataset

```bash
python scripts/collect_data.py
```

- Para cada letra listada em `SIGNS` (dentro do script), o programa faz uma contagem de 3 segundos e depois grava 200 amostras.
- **Mexa a mão devagar** durante a gravação: incline, aproxime e afaste um pouco. Isso deixa o dataset variado e é o que mais melhora a precisão.
- `Q` interrompe tudo. Ao rodar de novo, ele continua de onde parou.
- As amostras ficam em `data/processed/dataset.csv`.

Para regravar uma letra que ficou ruim:

```bash
python scripts/remove_sign.py L U     # apaga as amostras de L e U (faz backup do CSV)
python scripts/collect_data.py        # grava só o que está faltando
```

## Treinando o modelo

```bash
python scripts/train_model.py
```

O script:

1. separa o **final de cada letra** como teste (as amostras são gravadas em sequência, e testar em quadros idênticos aos do treino daria uma precisão falsamente alta);
2. imprime a precisão e o relatório por letra;
3. salva a matriz de confusão em `data/confusion_matrix.png`;
4. treina o modelo final com todos os dados e salva em `models/sign_classifier.pkl`.

Se a precisão ficar abaixo de 80%, ele avisa, mas salva o modelo mesmo assim.

## Testes

```bash
pip install -r requirements-dev.txt
python -m pytest
```

Os testes não precisam de câmera. Para conferir a webcam e o MediaPipe manualmente:

```bash
python scripts/check_detector.py
```

## Estrutura

```
SLT/
├── main.py                       # loop principal da aplicação
├── requirements.txt
├── requirements-dev.txt          # + pytest
├── src/
│   ├── config.py                 # caminhos e ajuste de display
│   ├── capture/camera_manager.py
│   ├── detection/hand_detector.py
│   ├── recognition/
│   │   ├── preprocessing.py      # normalização (compartilhada por treino e uso ao vivo)
│   │   └── sign_recognizer.py
│   ├── translation/text_builder.py
│   └── interface/frame_renderer.py
├── scripts/
│   ├── collect_data.py
│   ├── train_model.py
│   ├── remove_sign.py
│   └── check_detector.py
├── tests/
├── data/processed/dataset.csv
└── models/                       # hand_landmarker.task e sign_classifier.pkl
```

## Problemas comuns

**"Could not open the camera"** — feche outros programas que usam a webcam (Zoom, Meet, navegador). No Linux, confirme que seu usuário está no grupo `video` (`groups`) e teste com `ls /dev/video*`. Se houver mais de uma câmera, mude o índice em `CameraManager(index=0)`.

**No macOS**, autorize o Terminal (ou VS Code) em *Ajustes do Sistema → Privacidade → Câmera*.

**A janela não abre no Linux (erro do Qt / Wayland)** — o projeto já força o modo X11 automaticamente. Se ainda falhar, rode com `QT_QPA_PLATFORM=xcb python main.py`.

**`Trained model not found`** — o arquivo `models/sign_classifier.pkl` não existe. Rode `python scripts/train_model.py`.

**Letra errada ou instável** — veja `data/confusion_matrix.png` para descobrir quais letras se confundem e regrave essas letras com mais variação de ângulo e distância.

## Limitações atuais

- Reconhece apenas sinais **estáticos** (uma letra por pose); sinais com movimento não são suportados.
- Detecta **uma mão** por vez. Use a mesma mão que foi usada para gravar o dataset, pois a mão oposta é um espelho e o modelo não a reconhece.
- Só reconhece as letras que estão em `SIGNS` no `collect_data.py` e que existem no dataset.
