#!/usr/bin/env babel-node

import solution from '../solution';

const port = 8080;
solution().listen(port, () => {
  console.log(`Server was started on '${port}'`);
});
