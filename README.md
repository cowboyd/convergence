# @bigtest/convergence [![CircleCI](https://circleci.com/gh/bigtestjs/convergence/tree/master.svg?style=svg)](https://circleci.com/gh/bigtestjs/convergence/tree/master)

Recognize a desired state and synchronize on when that state has been achieved.

## Why Convergence?

Let's say you want to write an assertion to verify a simple cause and
effect: when a certain button is clicked, a dialog appears containing
some text that gets loaded from the network.

In order to do this, you have to make sure that your assertion runs
_after_ the effect you're testing has been realized.

![Image of assertion after an effect](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/assertion-after.png)

If not, then you could end up with a false negative, or "flaky test"
because you ran the assertion too early. If you'd only waited a little
bit longer, then your test would have passed. So sad!

![Image of false negative test](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/false-negative.png)

In fact, test flakiness is the reason most people shy away from
writing big tests in JavaScript in the first place. It seems almost
impossible to write robust tests without having visibility into the
internals of your runtime so that you can manually synchronize on
things like rendering and data loading. Unfortunately, those can be a
moving target, and worse, they couple you to your framework.

But what if instead of trying to run our assertions at just the right
time, we ran them _many_ times until they either pass or we decide to
give up?

![Image of convergent assertion](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/convergent-assertion.png)

This is the essence of what `@bigtest/convergence` provides:
repeatedly testing for a condition and then allowing code to run when
that condition has been met.

And it isn't just for assertions either. Because it is a general
mechanism for synchronizing on any observed state, It can be used to
properly time test setup and teardown as well.

## Creating a Convergence

A convergent function is a function that runs repeatedly until it no
longer returns false or throws an error. When the function is finally
successfully executed, it is considered to be passing and a converging
promise will resolve. However, if the converging function does not pass
within the provided timeout period the promise will reject with the
last error thrown from the function.

### `when`

The `when` function allows you to synchronize on a condition

``` javascript
import { when } from '@bigtest/convergence'

when(() => expect($el).to.exist)
  .then(() => $el.get(0).click())
```

### `always`

Another common pattern is asserting that something **has not**
changed. For these scenarios, you want to detect that __the assertion
passes for the duration of a timeout period._

`always()` is just like `when()` except that the `assert` function is
looped over repeatedly until it fails for the first time or never
fails for the duration of the timeout.

``` javascript
// this will resolve when total is always 5
// for the duration of the timeout period

always(() => total === 5)
  .then(() => console.log("Yup. definitely 5"));
```
