'use strict'

publicDir = '/base/public'

describe 'My-Script spec', () ->
  beforeEach((done) ->
    jasmine.getFixtures().fixturesPath = publicDir + '/spec'
    loadFixtures('fixture.html')
    done()
  )
  it('something should be fine!', () ->
    res = 1 + 1
    expect(res).toBe(2)
  )
