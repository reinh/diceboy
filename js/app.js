(function() {
  var App;

  App = this.App = Ember.Application.create();

  this.App.store = DS.Store.create({
    revision: 12,
    adapter: 'DS.FixtureAdapter'
  });

  this.App.DiceSet = DS.Model.extend({
    name: DS.attr('string')
  });

  this.App.DiceSet.FIXTURES = [
    {
      name: 'd6',
      id: 1
    }, {
      name: '2d12',
      id: 2
    }
  ];

  this.App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {
      controller.input = "3d6 + 2d8 - 12 + d10";
      return controller.result = "";
    }
  });

  this.App.history = Ember.ArrayController.create({
    content: App.DiceSet.find()
  });

  this.App.IndexController = Ember.Controller.extend({
    roll: function() {
      var input, intermediateResult, item, items, result, _ref;
      input = this.get('input');
      items = App.history.get('content');
      if (!App.history.someProperty('name', input)) {
        item = App.DiceSet.createRecord({
          name: input
        });
      }
      _ref = Dice.parse(input), intermediateResult = _ref[0], result = _ref[1];
      intermediateResult = intermediateResult.join(' + ').replace(/\+ \-/g, ' - ');
      this.set('intermediateResult', intermediateResult);
      return this.set('result', result);
    }
  });

  this.App.HistoryView = Ember.CollectionView.extend({
    tagName: 'ul',
    itemViewClass: 'App.HistoryItemView',
    content: (function() {
      return App.history.get('content').toArray().reverse();
    }).property('App.history.@each').cacheable()
  });

  this.App.HistoryItemView = Ember.View.extend({
    template: Ember.Handlebars.compile("{{view.content.name}}}"),
    nameBinding: 'content.name',
    click: function() {
      var input;
      input = this.get('name');
      console.log(input);
      this.set('controller.input', input);
      return this.get('controller').send('roll');
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

  this.Dice = {
    roll: function(n) {
      return Math.floor(Math.random() * n) + 1;
    },
    history: [],
    parse: function(input) {
      var dice, die, parseDie;
      dice = input.replace(/-/g, '+-').replace(/\s+/g, '').split('+');
      parseDie = function(die) {
        var number, parts, sides;
        parts = die.split('d');
        if (parts.length === 1) {
          return parseInt(parts[0]);
        } else {
          number = parseInt(parts[0] === "" ? "1" : parts[0]);
          sides = parseInt(parts[1]);
          return number * this.Dice.roll(sides);
        }
      };
      dice = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dice.length; _i < _len; _i++) {
          die = dice[_i];
          _results.push(parseDie(die));
        }
        return _results;
      })();
      return [dice, dice.sum()];
    }
  };

}).call(this);
