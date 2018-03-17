import {bootstrap, Application, Store} from './lib.js'
// application identity
const KEY  = 'TODO:1'
// filters metadata
const FILTERS = [
  { id:'all', name:'All', values: [true, false] },
  { id:'active', name:'Active', values: [false] },
  { id:'completed', name:'Completed', values: [true] } 
]
// static resources
const R = {
  title:'todos',
  hint:'Double-click to edit a todo',
  new_todo_hint:'What needs to be done?',
  filters: FILTERS 
}
// Provides state/logic for TodoApp
class TodoStore extends Store {
  constructor() {
    super(JSON.parse(localStorage.getItem(KEY)||'null') || { items: [], nextId:1 }, R)
  }
  // overriden for sake of persistence
  assign(delta){
    super.assign(delta)
    localStorage.setItem(KEY , JSON.stringify(this.data))
  }
  // actions:
  doInverse ({items}, { id }) {
    return { items: items.map(e => {if(e.id===id) { e.completed=!e.completed }; return e}) } 
  }
  doSave ({items}, { id, value }) {
    return { items: (!value) ? items.filter(e => e.id !== id) : items.map(e => {if(e.id===id) { e.name = value }; return e}) } 
  }
  doRm ({items}, { id }) {
    return { items: items.filter(e => e.id !== id) }
  }
  doFilter (st, { filterId }) {
    return { filterId: FILTERS.find(e=>e.id===filterId) ? filterId : 'all' }
  }
  doPurge ({items}) {
    return { items: items.filter(e => !e.completed) }
  }
  doToggle ({items}, { value }) {
    return { items: items.map(e => { e.completed=value; return e}) } 
  }
  doAdd ({ items, nextId }, { value }) {
    return !value ? null : {nextId: nextId+1, items: [].concat({ id: nextId, name: value, completed: false }, items) }
  }
  // properties:
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
  // special guest: dynamic component type for footer
  getFooterType(){
    const type = 'Attribution'+'Info'
    return `${type}`
  }
}
// top-level app component
class TodoApp extends Application {
  // use TodoStore
  createStore () {
    return new TodoStore()
  }
  // use hash as a filter key
  onhashchange(hash){
    this.dispatch('filter', {filterId: hash || FILTERS[0].id})
  }
} 
// launch
bootstrap(window.document.body, TodoApp).render()