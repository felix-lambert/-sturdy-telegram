module.exports = () => {
  const ENV = process.env.NODE_ENV || 'test';
  console.log(`NODE_ENV = ${ENV}`);
  return ENV;
};
