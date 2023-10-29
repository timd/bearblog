import exp from 'constants';
import { removeBearTag} from '../src/postHelpers'

describe('Arithmetic operations', () => {
  test('addition', () => {
    expect(1 + 1).toBe(2);
  });
  
  test('subtraction', () => {
    expect(2 - 1).toBe(1);
  });
});

describe('content helpers', () => {

  test('should remove Bear tag', () => {

    const startText = "foo bar #bear-blog-tag bing bang"
    const result = removeBearTag(startText)
    expect(result).toBe('foo bar bing bang')
  })

})