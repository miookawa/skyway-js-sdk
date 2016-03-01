'use strict';

const assert     = require('power-assert');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

let Connection;
let MediaConnection;

describe('MediaConnection', () => {
  let stub;
  let startSpy;
  let cleanupSpy;

  beforeEach(() => {
    stub = sinon.stub();
    startSpy = sinon.spy();
    cleanupSpy = sinon.spy();

    stub.returns({
      startConnection: startSpy,
      cleanup:         cleanupSpy
    });

    Connection = proxyquire(
      '../src/connection',
      {'./negotiator': stub}
    );
    MediaConnection = proxyquire(
      '../src/mediaConnection',
      {'./connection': Connection}
    );
  });

  afterEach(() => {
    startSpy.reset();
    cleanupSpy.reset();
  });

  describe('Constructor', () => {
    it('should call negotiator\'s startConnection method when created', () => {
      const mc = new MediaConnection({_stream: {}});

      assert(mc);
      assert(startSpy.calledOnce);
    });

    it('should store any messages passed in when created', () => {
      const mc = new MediaConnection(
        {_stream: {}, _queuedMessages: ['message']}
      );
      assert.deepEqual(mc.options._queuedMessages, ['message']);
    });
  });

  describe('Add Stream', () => {
    it('should set remoteStream upon addStream being invoked', () => {
      const mc = new MediaConnection({_stream: {}});

      let spy = sinon.spy(mc, 'addStream');

      mc.addStream('fakeStream');

      assert(mc);
      assert(spy.calledOnce);
      assert.equal(mc.remoteStream, 'fakeStream');

      spy.restore();
    });

    it('should emit a \'stream\' event upon addStream being invoked', () => {
      const mc = new MediaConnection({_stream: {}});

      let spy = sinon.spy(mc, 'emit');

      mc.addStream('fakeStream');

      assert(mc);
      assert(spy.calledOnce);
      assert(spy.calledWith('stream', 'fakeStream') === true);

      spy.restore();
    });
  });

  describe('Cleanup', () => {
    it('should close the socket and call the negotiator to cleanup on close()', () => {
      const mc = new MediaConnection({_stream: {}});

      // Force to be open
      mc.open = true;

      let spy = sinon.spy(mc, 'close');

      mc.close();
      assert(mc);
      assert(spy.calledOnce);
      assert.equal(mc.open, false);

      assert(cleanupSpy.called);
      assert(cleanupSpy.calledWith(mc));
    });
  });
});
