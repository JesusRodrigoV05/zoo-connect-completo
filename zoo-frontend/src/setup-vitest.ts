import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

if (typeof window !== 'undefined' && !globalThis.document) {
  (globalThis as any).document = window.document;
}

TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);