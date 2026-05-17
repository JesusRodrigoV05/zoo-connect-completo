import jasmineCore from "jasmine-core";

(globalThis as any).jasmine = jasmineCore;

import { getTestBed, TestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

afterEach(() => {
  TestBed.resetTestingModule();
});
