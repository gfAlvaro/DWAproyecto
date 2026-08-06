import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
