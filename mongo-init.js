db = db.getSiblingDB('Rentranzact');
db.createUser({
  user: 'mongoadmin',
  pwd: 'mongoadmin20241506',
  roles: [{ role: 'readWrite', db: 'Rentranzact' }]
});
