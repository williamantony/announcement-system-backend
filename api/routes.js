const router = {
  user: require('./routes/user.route'),
  events: require('./routes/events.route'),
};

module.exports = server => {

  server.use('/user', router.user);
  server.use('/events', router.events);

};