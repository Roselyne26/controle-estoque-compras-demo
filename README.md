# Controle estoque/compras — Demo

Demonstração conectada exclusivamente ao Firebase estoque-demo. O botão Entrar na demo autentica o visitante anonimamente e cria exemplos fictícios na primeira entrada. Cada visitante acessa apenas visitantes/{uid}/..., com regras que verificam seu UID. A identidade é mantida pelo Firebase no navegador; outro navegador ou limpeza dos dados pode criar uma nova identidade.

## Console Firebase
1. Authentication: ative Anônimo e salve.
2. Firestore Database: crie o banco (default), edição Standard, em modo de produção.
3. Publique firestore.rules na aba Regras.

## Publicação
Dentro desta pasta, com Firebase CLI autenticada:

    firebase deploy --project estoque-demo --only hosting,firestore

Publique apenas esta pasta. A entrada anônima e o carregamento dos seis produtos fictícios foram verificados na versão publicada. Não há senha para compartilhar.

## Demo online

https://estoque-demo.web.app

## Executar localmente

Sirva esta pasta com um servidor HTTP estático. O aplicativo usa módulos JavaScript e o SDK Firebase via CDN; não exige build. Para usar seu próprio projeto Firebase, substitua firebaseConfig em socorro2026.js e configure .firebaserc e o site em firebase.json.

