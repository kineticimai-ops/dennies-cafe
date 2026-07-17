const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dennie's Cafe site listening on port ${PORT}`);
  });
}

module.exports = app;
