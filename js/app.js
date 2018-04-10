// application identity
const KEY  = 'TODO:1'
// filters metadata
const FILTERS = [
  { id:'all', name:'All', values: [true, false] },
  { id:'active', name:'Active', values: [false] },
  { id:'completed', name:'Completed', values: [true] } 
]
//pure actions:
const ACTIONS={
  inverse: ({items}, { id }) => ({ items: items.map(e => {if(e.id===id) { e.completed=!e.completed }; return e}) }),
  save: ({items}, { id, value }) => ({ items: (!value) ? items.filter(e => e.id !== id) : items.map(e => {if(e.id===id) { e.name = value }; return e}) }),
  rm: ({items}, { id }) =>({ items: items.filter(e => e.id !== id) }) ,
  filter: (st, { filterId }) => ({ filterId: FILTERS.find(e=>e.id===filterId) ? filterId : 'all' }),
  purge: ({items}) =>({ items: items.filter(e => !e.completed) }),
  toggle: ({items}, { value }) => ({ items: items.map(e => { e.completed=value; return e}) }),
  add: ({ items, nextId }, { value }) => !value ? null : {nextId: nextId+1, items: [].concat({ id: nextId, name: value, completed: false }, items) }
}
// static resources
const R = {
  title:'todos',
  hint:'Double-click to edit a todo',
  new_todo_hint:'What needs to be done?',
  filters: FILTERS 
}
// placeholders pipes 
const PIPES = { 
  upper : s=>(''+s).toUpperCase() 
}
// top-level app component
class TodoApp {
  constructor () {
    this.subscribers = new Map()
    this.data = JSON.parse(localStorage.getItem(KEY)||'null') || { items: [], nextId:1 }
    this.res = (key) => R[key] || (R[key] = key.split('_').map(s => s.slice(0, 1).toUpperCase() + s.slice(1)).join(' '))
    this.pipes = PIPES
  }
  // hook on init
  init () {
    // use hash as a filter key. invoke immediately.
    const onhash = () => this.dispatch('filter', {filterId: window.location.hash.slice(1) || FILTERS[0].id})
    window.onhashchange = onhash
    onhash()
  }
  update(delta){
    Object.assign(this.data, delta)
    localStorage.setItem(KEY , JSON.stringify(this.data))
    this.assign({})
    this.subscribers.forEach(({cb, key}) => cb(null, this.get(key)))
  }
  // event-driven
  dispatch (key, payload) {
    this.update(ACTIONS[key](this.data, payload))
  }
  unsubscribe (subscriber) {
    this.subscribers.delete(subscriber)
  }
  subscribe (key, subscriber, cb) {
    this.subscribers.set(subscriber, {cb, key})
    cb(null, this.get(key))
  }
  // properties:
  get (key) {
    const getter = this['get' + key[0].toUpperCase() + key.slice(1)]
    return getter ? getter.call(this, this.data) : key.split('.').reduce((r, k) => !r ? null : r[k], this.data)
  }
  getShownItems({filterId, items}) {
    const values = !filterId? [] :FILTERS.find(e=>e.id===filterId).values
    return items.filter(e => values.includes(!!e.completed))
  }
  getNotEmpty({items}) {
    return items.length > 0
  }
  getItemsLeft({items}) {
    return items.filter(e=>!e.completed).length
  }
  getHasCompleted({items}) {
    return items.length - this.getItemsLeft({items})
  }
  getShownItemsCount({filterId, items}) {
    return this.getShownItems({filterId, items}).length
  }
  // special guest: dynamic component type
  getFooterType() {
    return this.get('shownItemsCount') > 0 ? 'Hint' : 'Attribution' 
  }
}
Dzi.launch(TodoApp)