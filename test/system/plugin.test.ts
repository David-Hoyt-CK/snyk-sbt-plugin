import * as path from 'path';
import * as test from 'tap-only';
import * as sinon from 'sinon';
import * as plugin from '../../lib';
import * as subProcess from '../../lib/sub-process';

test('run inspect()', async (t) => {
  const result: any = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-0.13/build.sbt', { debug: true});
  t.equal(result.package
    .dependencies['axis:axis']
    .dependencies['axis:axis-jaxrpc']
    .dependencies['org.apache.axis:axis-jaxrpc'].version,
  '1.4',
  'correct version found');
});

test('run inspect() on 1.2.8', async (t) => {
  const result: any  = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
  'testproj-1.2.8/build.sbt', {});
  t.equal(result.package
    .dependencies['axis:axis']
    .dependencies['axis:axis-jaxrpc']
    .dependencies['org.apache.axis:axis-jaxrpc'].version,
  '1.4',
  'correct version found');
});

test('run inspect() with coursier on 0.17', async (t) => {
  const result: any  = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-coursier-0.13/build.sbt', {});
  t.equal(result.package
    .dependencies['axis:axis']
    .dependencies['axis:axis-jaxrpc']
    .dependencies['org.apache.axis:axis-jaxrpc'].version,
  '1.4',
  'correct version found');
});

test('run inspect() with coursier on 1.2.8', async (t) => {
  const result: any  = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-coursier-1.2.8/build.sbt', {});
  t.equal(result.package
    .dependencies['axis:axis']
    .dependencies['axis:axis-jaxrpc']
    .dependencies['org.apache.axis:axis-jaxrpc'].version,
  '1.4',
  'correct version found');
});

test('run inspect() with no sbt plugin on 0.13', async (t) => {
  try {
    await plugin.inspect(path.join(
    __dirname, '..', 'fixtures', 'testproj-noplugin-0.13'),
  'build.sbt', {});
    t.fail('should not be reached');
  } catch (error) {
    t.match(error.message, 'the `sbt-dependency-graph` plugin');
    t.pass('Error thrown correctly');
  }
});

test('run inspect() with commented out coursier on 0.13', async (t) => {
  const result: any  = await plugin.inspect(path.join(
    __dirname, '..', 'fixtures', 'testproj-faux-coursier-0.13'),
  'build.sbt', {});
  t.equal(result.package
    .dependencies['axis:axis']
    .dependencies['axis:axis-jaxrpc']
    .dependencies['org.apache.axis:axis-jaxrpc'].version,
  '1.4',
  'correct version found');
});

test('run inspect() on bad project requiring user input', async (t) => {
  try {
    await plugin.inspect(path.join(__dirname, '..', 'fixtures',
    'bad-project'), 'build.sbt', {});
    t.fail('Expected to fail');
  } catch (error) {
    t.match(error.message, 'code: 1');
    t.match(error.message, '(q)uit');
    t.pass('Error thrown correctly');
  }
});

test('run inspect() on bad-project cascade through all parsing options', async (t) => {
  try {
    await plugin.inspect(path.join(__dirname, '..', 'fixtures',
      'bad-project'), 'build.sbt', {'sbt-graph': true});
    t.fail('Expected to fail');
  } catch (error) {
    t.match(error.message, 'code: 1');
    t.match(error.message, '(q)uit');
    t.pass('Error thrown correctly');
  }
});

test('run inspect() with failing `sbt` execution', async (t) => {
  stubSubProcessExec(t);
  try {
    await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-0.13/build.sbt', {});
    t.fail('should not be reached');
  } catch (error) {
    t.match(error.message, 'abort');
    t.pass('Error thrown correctly');
  }
});

function stubSubProcessExec(t) {
  const executeStub = sinon.stub(subProcess, 'execute')
    .callsFake(() => {
      return Promise.reject(new Error('abort'));
    });
  t.teardown(executeStub.restore);
}

test('run inspect() on 0.13 with custom-plugin', async (t) => {
  const result: any = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-0.13/build.sbt', {'sbt-graph': true});
  t.equal(result.package
      .dependencies['axis:axis']
      .dependencies['axis:axis-jaxrpc']
      .dependencies['org.apache.axis:axis-jaxrpc'].version,
    '1.4',
    'correct version found');
});

test('run inspect() on 1.2.8 with custom-plugin', async (t) => {
  const result: any  = await plugin.inspect(path.join(__dirname, '..', 'fixtures'),
    'testproj-1.2.8/build.sbt', {'sbt-graph': true});
  t.equal(result.package
      .dependencies['axis:axis']
      .dependencies['axis:axis-jaxrpc']
      .dependencies['org.apache.axis:axis-jaxrpc'].version,
    '1.4',
    'correct version found');
});
