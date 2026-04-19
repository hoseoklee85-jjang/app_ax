exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'fake-jwt-token-12345' });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
};
