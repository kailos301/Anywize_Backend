import events from 'events';

let emitter;

export default () => {
  if (!emitter) {
    emitter = new events.EventEmitter();
  }

  return emitter;
};
