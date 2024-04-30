import { cssRule } from 'typestyle';

cssRule('html, body', {
  margin: 0,
  padding: 0,
});

//to prevent the vertical overflow of the root element
cssRule('#root', {
  overflow: 'hidden',
});
