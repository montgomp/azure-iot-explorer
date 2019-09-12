/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import * as webpack from 'webpack';
import prod from './webpack.prod';

const config: webpack.Configuration = {...prod};
config.plugins.push(new webpack.DefinePlugin({
    _CONTROLLER_ENDPOINT: "''"
}));

export default config;
