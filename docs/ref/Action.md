# Action

An action is something people can interact with in the world.

### `action.label`: String

The label shown to the user when they are nearby. Defaults to `Interact`.

### `action.distance`: Number

The distance in meters that the action should be displayed. The engine will only ever show this if they are nearby AND there is no other action that is closer. Defaults to `3`.

### `action.duration`: Number

How long the player must hold down the interact button to trigger it, in seconds. Defaults to `0.5`

### `action.onStart`: Function

The function to call when the interact button is first pressed.

### `action.onTrigger`: Function

The function to call when the interact button has been held down for the full `duration`.

### `action.onCancel`: Function

The function call if the interact button is released before the full `duration`.

### `action.{...Node}`

Inherits all [Node](/docs/ref/Node.md) properties

