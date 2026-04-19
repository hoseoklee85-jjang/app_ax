fetch('http://localhost:3000/api/agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '주문 관리로 가줘' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
