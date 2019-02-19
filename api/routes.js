const router = {
  user: require('./routes/user.route'),
  people: require('./routes/people.route'),
  events: require('./routes/events.route'),
};

module.exports = server => {

  server.use('/user', router.user);
  server.use('/people', router.people);
  server.use('/events', router.events);

};
