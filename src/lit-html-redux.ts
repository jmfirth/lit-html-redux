import { TemplateResult } from 'lit-html'
import { Action, bindActionCreators, combineReducers, createStore, Dispatch, Store } from 'redux'

export interface DispatchContext<State> {
  dispatch: Dispatch<State>
}

export type Context<State extends {}, TStateContext, TDispatchContext> = TStateContext &
  TDispatchContext & {
    dispatch: Dispatch<State>
    provider: Provider<State>
  }

export type ConnectedTemplateFactory<State> = (
  { provider }: { provider: Provider<State> }
) => TemplateResult

export const connect = <State extends {}, StateContext extends {}, DispatchContext extends {}>(
  mapStateToContext?: (state: State) => StateContext,
  mapDispatchToContext?: (dispatch: Dispatch<State>) => DispatchContext
) => (
  factory: (context: Context<State, StateContext, DispatchContext>) => TemplateResult
): ConnectedTemplateFactory<State> => ({
  provider
}: {
  provider: Provider<State>
}): TemplateResult =>
  factory({
    ...Object(mapStateToContext ? mapStateToContext(provider.store.getState()) : {}),
    ...Object(mapDispatchToContext ? mapDispatchToContext(provider.store.dispatch) : {}),
    dispatch: provider.store.dispatch,
    provider: provider
  })

export type Update<State> = (provider: Provider<State>) => void

export type Unsubscribe = () => void

export class Provider<State> {
  protected _update?: Update<State>

  constructor(public store: Store<State>, update?: Update<State>) {
    this._update = update
    this.store.subscribe(() => this.update())
  }

  public update(): void {
    if (!this._update) {
      return
    }
    this._update(this)
  }

  public subscribe(listener: () => void): Unsubscribe {
    return this.store.subscribe(listener)
  }

  public render(factory: ConnectedTemplateFactory<State>): TemplateResult {
    return factory({ provider: this })
  }
}

export function createProvider<State>(store: Store<State>, update?: Update<State>) {
  return new Provider(store, update)
}
