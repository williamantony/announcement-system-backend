const router = {
  events: require('./routes/events.route'),
};

module.exports = server => {

  server.use('/events', router.events);

};