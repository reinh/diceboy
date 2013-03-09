(function() {
  var App;

  this.Dice = (function() {

    function Dice(sides) {
      this.sides = sides;
      this.result || (this.result = Math.floor(Math.random() * this.sides) + 1);
      this.display = this.result;
    }

    return Dice;

  })();

  this.DiceModifier = (function() {

    function DiceModifier(result) {
      this.result = result;
      this.display = this.result > 0 ? "+ " + this.result : "- " + (Math.abs(this.result));
    }

    return DiceModifier;

  })();

  App = this.App = Ember.Application.create();

  this.App.store = DS.Store.create({
    revision: 12,
    adapter: 'DS.FixtureAdapter'
  });

  this.App.DiceSet = DS.Model.extend({
    name: DS.attr('string', {
      defaultValue: null
    }),
    diceString: DS.attr('string'),
    lastRolled: DS.attr('date'),
    input: (function() {
      var diceString, name, str;
      name = this.get('name');
      diceString = this.get('diceString');
      str = "";
      if (name != null) {
        str = "" + name + ": ";
      }
      return str = "" + str + diceString;
    }).property('name', 'diceString')
  });

  this.App.DiceSet.FIXTURES = [
    {
      diceString: 'd20',
      id: 1
    }, {
      diceString: 'd20 + 4',
      name: 'initiative',
      id: 2
    }, {
      diceString: 'd8',
      name: 'longsword',
      id: 3
    }
  ];

  this.App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {}
  });

  this.App.HistoryController = Ember.ArrayController.extend({
    sortProperties: ['id'],
    sortAscending: false
  });

  this.App.history = this.App.HistoryController.create({
    content: App.DiceSet.find()
  });

  this.App.IndexController = Ember.Controller.extend({
    roll: function() {
      return this._parseInput() || $('.roll-form').effect('bounce');
    },
    _parseInput: function() {
      var dice, diceString, die, input, item, matches, name;
      try {
        input = this.get('input');
        if (input === "") {
          return false;
        }
        input = input.split(/:\s*/);
        if (input.length === 1) {
          input.unshift(null);
        }
        name = input[0];
        diceString = input[1];
        matches = function(item) {
          if (name === null) {
            return diceString === item.get('diceString');
          } else {
            return name === item.get('name');
          }
        };
        if (item = App.history.find(matches)) {
          item.setProperties({
            name: name,
            diceString: diceString,
            lastRolled: new Date()
          });
          item.store.commit();
        } else {
          item = App.DiceSet.createRecord({
            name: name,
            diceString: diceString,
            lastRolled: new Date()
          });
        }
        dice = DiceParser.parse(diceString);
        this.set('dice', dice);
        this.set('result', ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = dice.length; _i < _len; _i++) {
            die = dice[_i];
            _results.push(die.result);
          }
          return _results;
        })()).sum());
        $('.result').effect('highlight', {
          color: '#ffe'
        }, 500);
        return true;
      } catch (error) {
        return false;
      }
    }
  });

  this.App.HistoryView = Ember.CollectionView.extend({
    contentBinding: 'App.history.arrangedContent',
    itemViewClass: 'App.HistoryItemView'
  });

  this.App.HistoryItemView = Ember.View.extend({
    classNames: ['history-item', 'span6'],
    template: Ember.Handlebars.compile("{{view.content.diceString}}\n<div class=\"item-name\">\n  {{view.content.name}}\n</div>"),
    inputBinding: 'content.input',
    click: function() {
      var input;
      input = this.get('input');
      this.set('controller.input', input);
      this.get('controller').send('roll');
      return $('html, body').animate({
        scrollTop: 0
      }, 200);
    }
  });

  this.App.DiceRoller = Ember.View.extend({
    templateName: 'dice_roller',
    button: Ember.View.extend({
      tagName: 'button',
      classNames: ['btn'],
      click: function() {
        this.get('controller').send('roll');
        return false;
      }
    })
  });

  Array.prototype.sum = function() {
    return this.reduce(function(x, y) {
      return x + y;
    });
  };

  Array.prototype.flatten = function() {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      element = this[_i];
      if (element.flatten != null) {
        flattened = flattened.concat(element.flatten());
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  Number.prototype.times = function(fn) {
    var _i, _ref, _results;
    _results = [];
    for (_i = 1, _ref = this.valueOf(); 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      _results.push(fn());
    }
    return _results;
  };

  this.DiceParser = {
    parse: function(input) {
      var dice, die, parseDie;
      dice = input.replace(/-/g, '+-').replace(/\s+/g, '').split('+');
      parseDie = function(die) {
        var number, parts, sides, _i, _results;
        parts = die.split('d');
        if (parts.length === 1) {
          return new this.DiceModifier(parseInt(parts[0]));
        } else {
          number = parseInt(parts[0] === "" ? "1" : parts[0]);
          sides = parseInt(parts[1]);
          return (function() {
            _results = [];
            for (var _i = 1; 1 <= number ? _i <= number : _i >= number; 1 <= number ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this).map(function() {
            return new this.Dice(sides);
          });
        }
      };
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dice.length; _i < _len; _i++) {
          die = dice[_i];
          _results.push(parseDie(die));
        }
        return _results;
      })()).flatten();
    }
  };

}).call(this);
