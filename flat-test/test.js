var assert = require('assert')
  , BackboneLinear = require('../dist/backbone.linear')
  , flatten = BackboneLinear.flatten
  , unflatten = BackboneLinear.unflatten

var primitives = {
    String: 'good morning'
  , Number: 1234.99
  , Boolean: true
  , Date: new Date
  , null: null
  , undefined: undefined
}

suite('Flatten Primitives', function() {
  Object.keys(primitives).forEach(function(key) {
    var value = primitives[key]

    test(key, function() {
      assert.deepEqual(flatten({
        hello: {
          world: value
        }
      }), {
        'hello.world': value
      })
    })
  })
})

suite('Unflatten Primitives', function() {
  Object.keys(primitives).forEach(function(key) {
    var value = primitives[key]

    test(key, function() {
      assert.deepEqual(unflatten({
        'hello.world': value
      }), {
        hello: {
          world: value
        }
      })
    })
  })
})

suite('Flatten', function() {
  test('Nested once', function() {
    assert.deepEqual(flatten({
      hello: {
        world: 'good morning'
      }
    }), {
      'hello.world': 'good morning'
    })
  })

  test('Nested twice', function() {
    assert.deepEqual(flatten({
      hello: {
        world: {
          again: 'good morning'
        }
      }
    }), {
      'hello.world.again': 'good morning'
    })
  })

  test('Multiple Keys', function() {
    assert.deepEqual(flatten({
      hello: {
        lorem: {
          ipsum: 'again',
          dolor: 'sit'
        }
      },
      world: {
        lorem: {
          ipsum: 'again',
          dolor: 'sit'
        }
      }
    }), {
      'hello.lorem.ipsum': 'again',
      'hello.lorem.dolor': 'sit',
      'world.lorem.ipsum': 'again',
      'world.lorem.dolor': 'sit'
    })
  })

  test('Custom Delimiter', function() {
    assert.deepEqual(flatten({
      hello: {
        world: {
          again: 'good morning'
        }
      }
    }, {
      delimiter: ':'
    }), {
      'hello:world:again': 'good morning'
    })
  })

  test('Empty Objects', function() {
    assert.deepEqual(flatten({
      hello: {
        empty: {
          nested: { }
        }
      }
    }), {
      'hello.empty.nested': { }
    })
  })

  if (typeof Buffer !== 'undefined') test('Buffer', function() {
    assert.deepEqual(flatten({
      hello: {
        empty: {
          nested: new Buffer('test')
        }
      }
    }), {
      'hello.empty.nested': new Buffer('test')
    })
  })

  if (typeof Uint8Array !== 'undefined') test('typed arrays', function() {
    assert.deepEqual(flatten({
      hello: {
        empty: {
          nested: new Uint8Array([1,2,3,4])
        }
      }
    }), {
      'hello.empty.nested': new Uint8Array([1,2,3,4])
    })
  })

  test('Custom Depth', function() {
    assert.deepEqual(flatten({
      hello: {
        world: {
          again: 'good morning'
        }
      }
    }, {
      maxDepth: 2
    }), {
      'hello.world': {
        again: 'good morning'
      }
    })
  })
})

suite('Unflatten', function() {
  test('Nested once', function() {
    assert.deepEqual({
      hello: {
        world: 'good morning'
      }
    }, unflatten({
      'hello.world': 'good morning'
    }))
  })

  test('Nested twice', function() {
    assert.deepEqual({
      hello: {
        world: {
          again: 'good morning'
        }
      }
    }, unflatten({
      'hello.world.again': 'good morning'
    }))
  })

  test('Multiple Keys', function() {
    assert.deepEqual({
      hello: {
        lorem: {
          ipsum: 'again',
          dolor: 'sit'
        }
      },
      world: {
        lorem: {
          ipsum: 'again',
          dolor: 'sit'
        }
      }
    }, unflatten({
      'hello.lorem.ipsum': 'again',
      'hello.lorem.dolor': 'sit',
      'world.lorem.ipsum': 'again',
      'world.lorem.dolor': 'sit'
    }))
  })

  test('Custom Delimiter', function() {
    assert.deepEqual({
      hello: {
        world: {
          again: 'good morning'
        }
      }
    }, unflatten({
      'hello world again': 'good morning'
    }, {
      delimiter: ' '
    }))
  })

  test('Overwrite', function() {
    assert.deepEqual({
      travis: {
        build: {
          dir: "/home/travis/build/kvz/environmental"
        }
      }
    }, unflatten({
      travis: "true",
      travis_build_dir: "/home/travis/build/kvz/environmental"
    }, {
      delimiter: '_',
      overwrite: true,
    }))
  })

  test('Messy', function() {
    assert.deepEqual({
      hello: { world: 'again' },
      lorem: { ipsum: 'another' },
      good: {
        morning: {
          hash: {
            key: { nested: {
              deep: { and: { even: {
                deeper: { still: 'hello' }
              } } }
            } }
          },
          again: { testing: { 'this': 'out' } }
        }
      }
    }, unflatten({
      'hello.world': 'again',
      'lorem.ipsum': 'another',
      'good.morning': {
        'hash.key': {
          'nested.deep': {
            'and.even.deeper.still': 'hello'
          }
        }
      },
      'good.morning.again': {
        'testing.this': 'out'
      }
    }))
  })

  suite('.safe', function() {
    test('Should protect arrays when true', function() {
      assert.deepEqual(flatten({
        hello: [
            { world: { again: 'foo' } }
          , { lorem: 'ipsum' }
        ]
        , another: {
          nested: [{ array: { too: 'deep' }}]
        }
        , lorem: {
          ipsum: 'whoop'
        }
      }, {
        safe: true
      }), {
        hello: [
            { world: { again: 'foo' } }
          , { lorem: 'ipsum' }
        ]
        , 'lorem.ipsum': 'whoop'
        , 'another.nested': [{ array: { too: 'deep' }}]
      })
    })

    test('Should not protect arrays when false', function() {
      assert.deepEqual(flatten({
        hello: [
            { world: { again: 'foo' } }
          , { lorem: 'ipsum' }
        ]
      }, {
        safe: false
      }), {
          'hello.0.world.again': 'foo'
        , 'hello.1.lorem': 'ipsum'
      })
    })
  })

  suite('.object', function() {
    test('Should create object instead of array when true', function() {
      var unflattened = unflatten({
        'hello.you.0': 'ipsum',
        'hello.you.1': 'lorem',
        'hello.other.world': 'foo'
      }, {
        object: true
      });
      assert.deepEqual({
        hello: {
          you: {
            0: 'ipsum',
            1: 'lorem',
          },
          other: { world: 'foo' }
        }
      }, unflattened);
      assert(!Array.isArray(unflattened.hello.you));
    })

    test('Should create object instead of array when nested', function() {
      var unflattened = unflatten({
        'hello': {
          'you.0': 'ipsum',
          'you.1': 'lorem',
          'other.world': 'foo'
        }
      }, {
        object: true
      });
      assert.deepEqual({
        hello: {
          you: {
            0: 'ipsum',
            1: 'lorem',
          },
          other: { world: 'foo' }
        }
      }, unflattened);
      assert(!Array.isArray(unflattened.hello.you));
    })

    test('Should not create object when false', function() {
      var unflattened = unflatten({
        'hello.you.0': 'ipsum',
        'hello.you.1': 'lorem',
        'hello.other.world': 'foo'
      }, {
        object: false
      });
      assert.deepEqual({
        hello: {
          you: ['ipsum', 'lorem'],
          other: { world: 'foo' }
        }
      }, unflattened);
      assert(Array.isArray(unflattened.hello.you));
    })
  })

  if (typeof Buffer !== 'undefined') test('Buffer', function() {
    assert.deepEqual(unflatten({
      'hello.empty.nested': new Buffer('test')
    }), {
      hello: {
        empty: {
          nested: new Buffer('test')
        }
      }
    })
  })

  if (typeof Uint8Array !== 'undefined') test('typed arrays', function() {
    assert.deepEqual(unflatten({
      'hello.empty.nested': new Uint8Array([1,2,3,4])
    }), {
      hello: {
        empty: {
          nested: new Uint8Array([1,2,3,4])
        }
      }
    })
  })
})

suite('Arrays', function() {
  test('Should be able to flatten arrays properly with safe : false', function() {
    assert.deepEqual({
        'a.0': 'foo'
      , 'a.1': 'bar'
    }, flatten({
      a: ['foo', 'bar']
    }, {
        safe: false
    }))
  })

  test('Should be able to revert and reverse array serialization via unflatten', function() {
    assert.deepEqual({
      a: ['foo', 'bar']
    }, unflatten({
        'a.0': 'foo'
      , 'a.1': 'bar'
    }))
  })

  test('Array typed objects should be restored by unflatten', function () {
    assert.equal(
        Object.prototype.toString.call(['foo', 'bar'])
      , Object.prototype.toString.call(unflatten({
          'a.0': 'foo'
        , 'a.1': 'bar'
      }).a)
    )
  })

  test('Do not include keys with numbers??inside them', function() {
    assert.deepEqual(unflatten({
      '1key.2_key': 'ok'
    }), {
      '1key': {
        '2_key': 'ok'
      }
    })
  })
})
