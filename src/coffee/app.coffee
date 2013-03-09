class @Dice
  constructor: (@sides) ->
    @result ||= Math.floor(Math.random() * @sides) + 1
    @display = @result

class @DiceModifier
  constructor: (@result) ->
    @display = if @result > 0 then "+ #{@result}" else "- #{Math.abs(@result)}"

App = @App = Ember.Application.create()

@App.store = DS.Store.create
  revision: 12
  adapter: 'DS.FixtureAdapter'

@App.DiceSet = DS.Model.extend
  name: DS.attr 'string', defaultValue: null
  diceString: DS.attr 'string'
  lastRolled: DS.attr 'date'

  input: (->
    name = @get 'name'
    diceString = @get 'diceString'

    str = ""
    str = "#{name}: " if name?
    str = "#{str}#{diceString}"
  ).property('name', 'diceString')

@App.DiceSet.FIXTURES = [
  {diceString: 'd20',                         id: 1},
  {diceString: 'd20 + 4', name: 'initiative', id: 2}
  {diceString: 'd8',      name: 'longsword',  id: 3},
]

@App.IndexRoute = Ember.Route.extend
  setupController: (controller) ->

@App.HistoryController = Ember.ArrayController.extend
  sortProperties: ['lastRolled']
  sortAscending: false

@App.history = @App.HistoryController.create
  content: App.DiceSet.find()

@App.IndexController = Ember.Controller.extend
  roll: ->
    @_parseInput() or $('.roll-form').effect 'bounce'

  _parseInput: ->
    try
      input = @get 'input'
      return false if input is ""

      input = input.split(/:\s*/)

      # name is null unless specified
      input.unshift null if input.length is 1

      name = input[0]
      diceString = input[1]

      matches = (item) ->
        name is item.get('name') or diceString is item.get('diceString')

      if item = App.history.find matches
        item.setProperties
          name: name
          diceString: diceString
          lastRolled: new Date()
        item.store.commit()
      else
        item = App.DiceSet.createRecord
          name: name,
          diceString: diceString
          lastRolled: new Date()

      dice = DiceParser.parse diceString

      @set 'dice', dice
      @set 'result', (die.result for die in dice).sum()

      $('.result').effect 'highlight', {color: '#ffe'}, 500

      return true
    catch error
      return false

@App.HistoryView = Ember.CollectionView.extend
  tagName: 'ul'
  contentBinding: 'App.history.arrangedContent'
  itemViewClass: 'App.HistoryItemView'

@App.HistoryItemView = Ember.View.extend
  classNames: ['history-item']
  template: Ember.Handlebars.compile """
    {{view.content.diceString}}
    <div class="item-name">
      {{view.content.name}}
    </div>
  """

  inputBinding: 'content.input'

  click: ->
    input = @get('input')
    @set 'controller.input', input
    @get('controller').send 'roll'
    $('html, body').animate({scrollTop: 0}, 200)

@App.DiceRoller = Ember.View.extend
  templateName: 'dice_roller'

  button: Ember.View.extend
    tagName: 'button'
    classNames: ['btn']

    click: ->
      @get('controller').send 'roll'
      return false

Array::sum = -> @.reduce (x,y) -> x + y
Array::flatten = ->
  flattened = []
  for element in @
    if element.flatten?
      flattened = flattened.concat element.flatten()
    else
      flattened.push element
  flattened

Number::times = (fn) -> do fn for [1..@valueOf()]

@DiceParser =
  parse: (input) ->
    dice = input
      .replace(/-/g, '+-') # -8 becomes +-8
      .replace(/\s+/g, '') # strip spaces
      .split('+')          # split on '+'

    parseDie = (die) ->
      parts = die.split('d')
      if parts.length is 1
        new @DiceModifier(parseInt parts[0])
      else
        number = parseInt if parts[0] is "" then "1" else parts[0]
        sides = parseInt parts[1]
        [1..number].map -> new @Dice(sides)

    (parseDie die for die in dice).flatten()
