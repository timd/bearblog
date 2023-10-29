import { removeBearTag, extractTags } from '../src/postHelpers'

describe('Post helpers', () => {

  test('should remove Bear tag', () => {
    const startText = "foo bar #bear-blog-tag bing bang"
    const result = removeBearTag(startText)
    expect(result).toBe('foo bar bing bang')
  })

  test('should extract tags from the content', () => {
    const sourceText = "abc #def ghi #jkl"
    const expectedTags = "[\"def\", \"jkl\"]"
    const result = extractTags(sourceText)
    expect(result).toBe(expectedTags)
  })

})