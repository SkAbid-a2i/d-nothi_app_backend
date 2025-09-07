const app = require('./app');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});