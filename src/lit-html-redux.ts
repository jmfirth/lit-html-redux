import { TemplateResult } from 'lit-html'
import { Action, bindActionCreators, combineReducers, createStore, Dispatch, Store } from 'redux'

export interface Component<TContext> {
  (context: TContext): TemplateResult
}

export interface SubscriberComponent<TState> {
  (publisher: Publisher<TState>): TemplateResult
}

export interface RootComponent<TState> {
  (publisher: Publisher<TState>): any
}

export interface DispatchContext<TState> {
  dispatch: Dispatch<TState>
}

export interface PublisherContext<TState> {
  publisher: Publisher<TState>
}

export interface Listener {
  (): any
}

export interface Unsubscribe {
  (): void
}

export class Publisher<TState> {
  constructor(public root: RootComponent<TState>, public store: Store<TState>) {
    this.store.subscribe(() => this.mount())
    this.publish(root)
  }

  public mount(): void {
    this.root!(this)
  }

  public subscribe(listener: Listener): Unsubscribe {
    return this.store.subscribe(listener)
  }

  public publish(subscriber: SubscriberComponent<TState>): TemplateResult {
    return subscriber(this)
  }
}

export const createPublisher = <TState>(root: RootComponent<TState>, store: Store<TState>) =>
  new Publisher(root, store)

export type ConnectedContext<
  TState extends any = any,
  TStateContext extends {} = {},
  TDispatchContext extends {} = {}
> = TStateContext & TDispatchContext & DispatchContext<TState> & PublisherContext<TState>

export const createSubscriber = <
  TState extends any,
  TStateContext extends {},
  TDispatchContext extends {}
>(
  mapStateToContext?: (state: TState) => TStateContext,
  mapDispatchToContext?: (dispatch: Dispatch<TState>) => TDispatchContext
) => (
  component: Component<ConnectedContext<TState, TStateContext, TDispatchContext>>
): SubscriberComponent<TState> => provider =>
  component({
    ...(mapStateToContext ? mapStateToContext(provider.store.getState()) : {}),
    ...Object(mapDispatchToContext ? mapDispatchToContext(provider.store.dispatch) : {}),
    dispatch: provider.store.dispatch,
    publisher: provider
  })
