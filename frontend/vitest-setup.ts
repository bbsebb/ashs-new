import 'zone.js';
import 'zone.js/testing';
import {ReadableStream, TransformStream, WritableStream} from 'node:stream/web';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting,} from '@angular/platform-browser-dynamic/testing';
import {TestBed} from '@angular/core/testing';

if (!globalThis.TransformStream) {
  // @ts-ignore
  globalThis.TransformStream = TransformStream;
}
if (!globalThis.ReadableStream) {
  // @ts-ignore
  globalThis.ReadableStream = ReadableStream;
}
if (!globalThis.WritableStream) {
  // @ts-ignore
  globalThis.WritableStream = WritableStream;
}

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
