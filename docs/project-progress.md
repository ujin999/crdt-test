# Step1. Basic Connection
## Server Side
클라이언트가 보낸 update를 수신하여 다른 클라이언트에게 전파한다.

## Client Side
클라이언트가 편집을 하면 update가 발생하고 update 된 내용을 서버에 전송한다.

### CRDT
사용자가 글자를 입력하면 내부적으로 CRDT 연산을 수행하고 update에 반영한다.</br>
그리고 이런 CRDT 구조를 다른 사용자는 받아서 현재 문서에 병합하는 과정을 거친다.</br>
CRDT 구조는 update 시 변경된 부분만 연산하여 전송한다.</br>
전체 문서를 보내는 것보다 변경된 부분만 보내어 데이터 전송량이 매우 작다.

### Progress of document update
```
[사용자 A 입력]
      ↓
Yjs가 update 생성
      ↓
WebSocket으로 전송
      ↓
서버가 다른 클라이언트에 전달
      ↓
[사용자 B]
Y.applyUpdate 실행
      ↓
자동 병합 → 화면 반영
```