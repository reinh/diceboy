App = @App = Ember.Application.create()

@App.store = DS.Store.create
  revision: 12
  adapter: 'DS.FixtureAdapter'

@App.DiceSet = DS.Model.extend
  name: DS.attr 'string'

@App.DiceSet.FIXTURES = [
  {name: 'd6',   id: 1},
  {name: '2d12', id: 2}
]

@App.IndexRoute = Ember.Route.extend
  setupController: (controller) ->
    controller.input = "3d6 + 2d8 - 12 + d10"
    controller.result = ""

@App.history = Ember.ArrayController.create
  content: App.DiceSet.find()

@App.IndexController = Ember.Controller.extend
  roll: ->
    input = @get 'input'
    items = App.history.get('content')

    unless App.history.someProperty 'name', input
      item = App.DiceSet.createRecord name: input

    [intermediateResult, result] = Dice.parse input
    intermediateResult = intermediateResult.join(' + ').replace(/\+ \-/g, ' - ')
    @set 'intermediateResult', intermediateResult
    @set 'result', result

@App.HistoryView = Ember.CollectionView.extend
  tagName: 'ul'
  itemViewClass: 'App.HistoryItemView'

  content: (->
    App.history.get('content').toArray().reverse()
  ).property('App.history.@each').cacheable()

@App.HistoryItemView = Ember.View.extend
  template: Ember.Handlebars.compile """
    {{view.content.name}}}
  """

  nameBinding: 'content.name'

  click: ->
    input = @get('name')
    console.log input
    @set 'controller.input', input
    @get('controller').send 'roll'

@App.DiceRoller = Ember.View.extend
  templateName: 'dice_roller'

  button: Ember.View.extend
    tagName: 'button'
    classNames: ['btn']

    click: ->
      @get('controller').send 'roll'
      return false

Array::sum = -> @.reduce (x,y) -> x + y

@Dice =
  roll: (n) -> Math.floor(Math.random() * n) + 1

  history: []

  parse: (input) ->
    dice = input
      .replace(/-/g, '+-') # -8 becomes +-8
      .replace(/\s+/g, '') # strip spaces
      .split('+')          # split on '+'

    parseDie = (die) ->
      parts = die.split('d')
      if parts.length is 1
        return parseInt parts[0]
      else
        number = parseInt if parts[0] is "" then "1" else parts[0]
        sides = parseInt parts[1]
        return number * @Dice.roll sides

    dice = (parseDie die for die in dice)
    return [dice, dice.sum()]

