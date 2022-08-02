# Data Validation

SurveyJS Library allows you to validate user responses on the client or server side. Regardless of the type, validation activates before a user proceeds to the next page or completes the survey. If the current page contains errors, the survey indicates them and focuses the first question with an invalid answer. If you want to run validation immediately after a user answers a question, set the Survey's [`checkErrorsMode`](https://surveyjs.io/Documentation/Library?id=surveymodel#checkErrorsMode) property to `"onValueChanging"`:

```js
const surveyJson = {
  "checkErrorsMode": "onValueChanging",
  "elements": [
    // ...
  ]
}
```

Refer to the sections below for information on how to enable validation in your survey:

- [Built-In Client-Side Validators](#built-in-client-side-validators)
- [Implement Custom Client-Side Validation](#implement-custom-client-side-validation)
- [Server-Side Validation](#server-side-validation)

## Built-In Client-Side Validators

SurveyJS Library supports multiple built-in client-side validators. The Required validator ensures that a question value is not empty. Enable a question's [`isRequired`](https://surveyjs.io/Documentation/Library?id=Question#isRequired) property to add the Required validator to this question. In addition, you can specify the [`requiredText`](https://surveyjs.io/Documentation/Library?id=Question#requiredText) property to override the default error message:

```js
const surveyJson = {
  "elements": [{
    "name": "question1",
    "type": "text",
    "isRequired": true,
    "requiredText": "Value cannot be empty"
  }]
}
```

If you want to specify the required state dynamically based on a condition, use the [`requiredIf`](https://surveyjs.io/Documentation/Library?id=Question#requiredIf) property. Refer to the following help topic for more information: [Conditional Visibility](/Documentation/Library?id=design-survey-conditional-logic#conditional-visibility).

Other validators are implemented as JavaScript classes. You can create an object of a validator class and push it to a question's [`validators`](https://surveyjs.io/Documentation/Library?id=Question#validators) array. Set the `text` property in the class constructor if you want to override the default error message:

```js
import { Model, NumericValidator } from "survey-core";

const surveyJson = { ... }
const survey = new Model(surveyJson);
const question = survey.getQuestionByName("question1")
question.validators.push(new NumericValidator({ text: "Value must be a number" }));
```

Alternatively, you can declare the `validators` array in the survey JSON definition:

```js
const surveyJson = {
  "elements": [{
    "name": "question1",
    "type": "text",
    "validators": [
      { "type": "numeric", "text": "Value must be a number" }
    ]
  }]
}
```

The following class-based validators are available:

| `type` (for JSON) | Validator Class (for JavaScript) | Description |
| ---- | --------------- | ----------- |
| `"numeric"` | [`NumericValidator`](https://surveyjs.io/Documentation/Library?id=NumericValidator) | Throws an error if the answer is not a number or if an entered number is outside the [`minValue`](https://surveyjs.io/Documentation/Library?id=NumericValidator#minValue) and [`maxValue`](https://surveyjs.io/Documentation/Library?id=NumericValidator#maxValue) range. |
| `"text"` | [`TextValidator`](https://surveyjs.io/Documentation/Library?id=TextValidator) | Throws an error if the length of entered text is outside the range between [`minLength`](https://surveyjs.io/Documentation/Library?id=TextValidator#minLength) and [`maxLength`](https://surveyjs.io/Documentation/Library?id=TextValidator#maxLength). |
| `"email"` | [`EmailValidator`](https://surveyjs.io/Documentation/Library?id=EmailValidator) | Throws an error if an entered value is not a valid e-mail address. |
| `"expression"` | [`ExpressionValidator`](https://surveyjs.io/Documentation/Library?id=ExpressionValidator) | Throws an error when the [`expression`](https://surveyjs.io/Documentation/Library?id=ExpressionValidator#expression) evaluates to `false` (see [Expressions](/Documentation/Library?id=design-survey-conditional-logic#expressions)). |
| `"answercount"` | [`AnswerCountValidator`](https://surveyjs.io/Documentation/Library?id=AnswerCountValidator) | Throws an error if a user selects fewer choices than specified by [`minCount`](https://surveyjs.io/Documentation/Library?id=AnswerCountValidator#minCount) or more choices than specified by [`maxCount`](https://surveyjs.io/Documentation/Library?id=AnswerCountValidator#maxCount). Applies only to question types that can have multiple values (for instance, [Checkbox](https://surveyjs.io/Documentation/Library?id=questioncheckboxmodel)). |
| `"regex"` | [`RegexValidator`](https://surveyjs.io/Documentation/Library?id=RegexValidator) | Throws an error if an entered value does not match a regular expression defined in the [`regex`](https://surveyjs.io/Documentation/Library?id=RegexValidator#regex) property. |

- [View the "Built-In Validators" example](https://surveyjs.io/Examples/Library?id=validators-standard)
- [View the "Expression Validator" example](https://surveyjs.io/Examples/Library?id=validators-expression) 

## Implement Custom Client-Side Validation

SurveyJS Library raises the [`onValidateQuestion`](https://surveyjs.io/Documentation/Library?id=surveymodel#onValidateQuestion) event, which you can handle to add custom validation logic to your survey. For example, the following code checks that the answer to a `"memo"` question contains the word "survey":

```js
import { Model } from "survey-core";
const surveyJson = {
  "elements": [{
    "name": "memo",
    "type": "comment",
    // ...
  }]
};
const survey = new Model(surveyJson);

survey.onValidateQuestion.add((survey, options) => {
  if (options.name === "memo") {
    if (options.value.indexOf("survey") === -1) {
      options.error = 'Your answer must contain the word "survey"'
    }
  }
});
```

Alternatively, you can use [expressions](https://surveyjs.io/Documentation/Library?id=design-survey-conditional-logic#expressions) to implement custom validation. Create a [custom function](https://surveyjs.io/Documentation/Library?id=design-survey-conditional-logic#custom-functions), register it, and then call it from within your expression. The following code uses this technique to implement the same value validation scenario:

```js
import { FunctionFactory } from "survey-core";

function validateComment (params) {
  const value = params[0];
  return value.indexOf("survey");
}

FunctionFactory.Instance.register("validateComment", validateComment);

const surveyJson = {
  "elements": [{
    "name": "memo",
    "type": "comment",
    "validators": [{
      "type": "expression",
      "text": "Your answer must contain the word \"survey\"",
      "expression": "validateComment({memo}) >= 0"
    }]
    // ...
  }]
};
```

[View example](https://surveyjs.io/Examples/Library?id=validators-custom)

## Server-Side Validation

If your validation logic requires a request to a server, make this request within the `onServerValidateQuestions` event handler. It accepts the survey as the first argument and an object with the following fields as the second argument:

- `data` - An object that contains question values.
- `errors` - An object for your error messages. Set error messages as follows: `errors["questionName"] = "My error message";`
- `complete()` - A method that you should call when the request has completed. 

In the following example, a callback assigned to the `onServerValidateQuestions` event handler fetches a list of countries and checks if an entered country is in this list:

```js
import { Model } from "survey-core";
const surveyJson = {
  "elements": [{
    "name": "country",
    "type": "text",
    // ...
  }]
};
const survey = new Model(surveyJson);

function validateCountry(survey, { data, errors, complete }) {
  const countryName = data["country"];
  if (!countryName) {
    complete();
    return;
  }
  fetch("https://surveyjs.io/api/CountriesExample?name=" + countryName)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const found = data.length > 0;
      if (!found) {
        errors["country"] = "Country is not found";
      }
      complete();
    });
}

survey.onServerValidateQuestions.add(validateCountry);
```

[View example](https://surveyjs.io/Examples/Library?id=validators-server)

Alternatively, you can use [expressions](https://surveyjs.io/Documentation/Library?id=design-survey-conditional-logic#expressions) to implement custom validation. Create an [asynchronous function](https://surveyjs.io/Documentation/Library?id=design-survey-conditional-logic#asynchronous-functions), register it, and then call it within your expression. The following code uses this technique to implement the previously demonstrated validation scenario:

```js
import { FunctionFactory } from "survey-core";

function doesCountryExist([ countryName ]) {
  if (!countryName) {
    this.returnResult();
    return;
  }
  fetch("https://surveyjs.io/api/CountriesExample?name=" + countryName)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const found = data.length > 0;
      this.returnResult(found);
    });
}

FunctionFactory.Instance.register("doesCountryExist", doesCountryExist, true);

const surveyJson = {
  "elements": [{
    "type": "text",
    "name": "country",
    "title": "Type a country:",
    "validators": [{
      "type": "expression",
      "text": "Country is not found",
      "expression": "doesCountryExist({country})"
    }]
  }]
};
```

## See Also

- [Access Survey Results](/Documentation/Library?id=handle-survey-results-access)
- [Conditional Logic and Dynamic Texts](/Documentation/Library?id=design-survey-conditional-logic)