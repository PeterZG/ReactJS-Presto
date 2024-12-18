
# ReactJS: Presto


## 0. Change Log

- 01/04 Fix movable element spec & video element's url option & Fix backend swaggerdoc 
- 06/05 Re-weighted feature set 2/3/4 to be more balanced as per the Web Development course content.


## 1. Before starting

### 1.1. Background

# Simulated Scenario

In March of 2024, I and my friends pitched a startup idea to produce *An alternative to [slides.com](https://slides.com) that is a lean, lightweight app that is a lot more enjoyable and interesting to use* and that will *revolutionize the presentations industry for decades to come*. We pitched this solution in the form of a web-based application, and called this quiz application 🪄🪄🪄**Presto**🪄🪄🪄.

A week later, we received a tentative $50,000 investment from an [Angel Investor](https://en.wikipedia.org/wiki/Angel_investor), pending that we produce a working minimum viable product (MVP) of the application.

Shortly after, we discussed the functionality and feature set, and wrote out a RESTful specification/interface together so that we could split up the frontend and backend work within the team. I decided to build the frontend, and they would handle the backend. To get things moving, the backend was built EXTREMELY light in order to reduce the amount of interfacing needed.

While I (and optionally another one of my friends) worked on building the frontend, I wrote a list of requirements and functionalities that my frontend should adhere to (described in `section 2`). I also decided to complete this application in `ReactJS`, a declarative framework for building single-page applications. This frontend will interact with a RESTful API that my team members are building, based on the pre-defined interface.

Since the MVP is only going to be demonstrated once, our team considers it imperative that the frontend is thoroughly tested.

To satisfy modern tastes and expectations, I also decided to ensure that the UI/UX and Accessibility standards are very high.

**This project is the process of building the frontend for that MVP (Minimum Viable Product) to the standards described.** This project is closely modeled off the popular website [slides](https://slides.com/). If you're not familiar with the site, I would recommend spending the time to try it out so that you can get a feel for how this application may function as a reference point.

### 1.2. Materials to watch

I watched the following lectures before starting (They helped me get started):
- [Javascript Ecosystem](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-ecosystem)
- [Node Package Manager](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-npm)
- [ReactJS Introduction](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-intro)
- [ReactJS Global CSS Usage](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-basic)
- [ReactJS Lifecycle](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-lifecycle)
- [ReactJS useState hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-state)
- [ReactJS useEffect hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-effect)
- [Working with multiple files](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/multi-file-import)
- [Components & Props](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-components-props)
- [Linting](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-linting)

I watched the following lectures to finish the project completely:
- [Routing & SPAs](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-routing-spas)
- [CSS Frameworks](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-frameworks)
- [useContext hook](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-context)
- [Testing introduction](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-intro)
- [Component testing](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-components)
- [UI Testing](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-ui)

**Note:** You may need to log in with the UNSW student account and be enrolled in the Web Development course to access these materials. However, you can also find relevant topics on platforms like YouTube or Bilibili to supplement my learning.


## 2. The Front-End

I am building the frontend for the provided backend. This frontend should be a single-page application that does **NOT** require a refresh for state updates. If the app doesn't function as a fully single-page app, it will result in significant penalties.

The requirements describe a series of **screens**. Screens can be presented as popups/modals, or full-page views. *Screen* refers to a specific state or representation of the web application. I have flexibility in how to implement them, whether as modals, separate pages, or other appropriate UI components.

Anything marked 🙉🙉🙉 only needs to be completed by pair attempts, not individual attempts.

### 2.1. Feature Set 1. Login & presentation Creation

This feature set focuses solely on the ability to register, login, and logout. It does not concern itself with any functionality or screens that come after logged in - if the dashboard when logged in is just a blank screen with a logout button, then that is satisfactory for this feature set.

#### 2.1.1. Login Screen
 * A unique route must exist for this screen
 * User must be able to enter their `email` and `password` in a form
 * A button must exist to allow submission of the form
 * If the form submission fails when user tried to login, a reasonable error message should be shown
 * The form must be able to be submitted on enter key in any of the fields

#### 2.1.2. Register Screen
 * A unique route must exist for this screen
 * User must be able to enter their `email` and `password` and `name` in a form
 * A confirm `password` field should exist where user re-enters their password
 * If the two passwords don't match, the user should receive an error popup before submission.
 * If the form submission fails when user tried to register, a reasonable error message should be shown
 * A button must exist to allow submission of form
 * The form must be able to be submitted on enter key in any of the fields

#### 2.1.3. Logout Button
 * On all screens that require an authorised user, a logout button exists.
 * This logout button, when clicked, returns you to the login screen.

### 2.2. Feature Set 2. Setting up slides

#### 2.2.1. New presentation on Dashboard

* When logged in, users should be presented with a dashboard that contains a button, only visible on the dashboard, called "New presentation".
* When this button is pressed, a [modal](https://www.w3schools.com/w3css/w3css_modal.asp) appears, where a user can enter the name of a new presentation
* This modal should contain a "Create" button, where when it is clicked, the modal disappears, a new presentation is created and appears on the dashboard. A default presentation contains a single empty slide (info on this later).

#### 2.2.2. List of presentations on Dashboard 

* A unique route must exist for dashboard screen
* On the dashboard, the [card](https://m1.material.io/components/cards.html#) for each presentation should appear as rectangles with a 2:1 width:height ratio.
* Each rectangle should include the name, a thumbnail (grey square if empty), a description (no text if empty) and the number of slides it contains
* Rectangles should be evenly spaced in several rows and columns if needed, where each rectangle has a minimum of `100px` width and maximum of `300px` width.

#### 2.2.3. Basics of a presentation controls

* When a particular presentation on the dashboard is clicked, the user should be taken to a new unique route that is parameterised by the presentation ID, which always loads the first slide in the slideshow deck. This route is for editing a specific presentation in a slideshow deck.
* When on this edit presentation page, Two key controls should always be visible and functional, regardless of which slide users are on:
  * "Back" that takes users back to the dashboard.
  * "Delete Presentation" which prompts "Are you sure?", where if "Yes" is clicked, the presentation is deleted and users are taken to the dashboard. If "No" is clicked, then the prompt disappears and the page remains still.

#### 2.2.4. Title editing

* When viewing a particular presentation, the title of the presentation should be visible at all times somewhere on or above the slideshow deck regardless of which slide users are on.
  * Somewhere near the title should have some text/icon/graphic/button that user can click to bring up a modal to edit the title of the presentation.

#### 2.2.5. Creating slides & moving between

* When visiting a particular slide, a button should be visible off the slides that allows users to create a new slide.
* Creating a new slide will add another slide at the end of the slideshow deck.
* Once the slideshow deck has at least two slides, controls should appear in the bottom right corner:
  * These controls should be two arrows, left and right.
  * When users click on these arrows, it takes them to the next or previous slide
  * When users click the associated keyboard keys(**left key** and **right key** in this case), the same corresponding action should happen
  * If users are viewing the first slide, there should be no previous arrow
  * If users are viewing the last slide, there should be no next arrow

#### 2.2.6. Deleting slides

* When visiting a particular slide, a button should be visible off the slide, which allows users to delete that slide.
* If a user tried to delete the only slide in the slideshow deck, an error should appear instead asking to delete the presentation.

#### 2.2.7. Slide numbers

* When viewing a particular slide, the slide number should be visible within the slide, position at the **bottom left**. The font-size should be `1em` of any colour, and it should be visible only within a `50px` by `50px` area. When you only have one slide left, this number will just be "1".

### 2.3. Feature Set 3. Putting Elements on a slide

* Any time when users are prompted for the "size" of an element below, size is always represented in percentage(%) as a number between 0 and 100 where:
  * For width, 100 represents the full width of the deck, 50 represents half the width, etc etc
  * For height, 100 represents the full height of the deck, 50 represents half the height, etc etc
* When any element is first added to the slide, it is always positioned at the top left corner of the slide.
* Double clicking (within 0.5 seconds) on any element in a slide will allow you to edit the initial properties(discussed in later scope) that are set when this element was created, as well as an extra property called *position* that describes where the top left of the element will appear on the slide. This property is expressed as an `x` and `y` co-ordinate between `0` and `100` (similar to what is described above).
* You can order the "layer" property of each element by having the most recent created element be higher than the previous one. This will help in situations where they are layered on top of one another.
* Each element in a slide can be deleted by right clicking anywhere within its block.

#### 2.3.1. Putting TEXT on the slide

* Somewhere on the slideshow edit screen, for each slide, there should be an action that is clearly described as adding a text box to the current slide. This action can be immediately visible in a list of tools, or can be hidden away by some kind of collapsable panel.
  * When this action is clicked, a modal should appear and accept inputs from users for 
    1) The size of the text area 
    2) The text in the textarea 
    3) The font size of the text in `em` as a decimal
    4) The colour the text as a [HEX color code](https://www.w3schools.com/css/css_colors_hex.asp).
  * The text is always top-down and left-aligned.
  * If any text overflows, it can simply be cut off.
* Each block should have a soft grey border around the outside of it.

#### 2.3.2. Putting an IMAGE on the slide

* Somewhere on the slideshow edit screen, for each slide, there should be an action that is clearly described as adding an image to the current slide. This action can be immediately visible in a list of tools, or can be hidden away by some kind of collapsable panel.
  * When this action is clicked, a modal should appear and accept inputs from users for 
    1) The size of the image area 
    2) Either the URL or a base64 string encoding of the whole image itself 
    3) A description of the image for an `alt` tag
  
#### 2.3.3. Putting a VIDEO on the slide

* Somewhere on the slideshow edit screen, for each slide, there should be an action that is clearly described as adding a video to the current slide. This action can be immediately visible in a list of tools, or can be hidden away by some kind of collapsable panel.
  * When this action is clicked, a modal should appear and accept inputs from users for 
    1) The size of the video area
    2) The URL of the youtube video to display 
    3) Whether or not the video should auto-play
  
#### 2.3.4. Putting CODE on the slide

* Somewhere on the slideshow edit screen, for each slide, there should be an action that is clearly described as adding a code block to the current slide. Code block is presented by a `textarea`. This action can be immediately visible in a list of tools, or can be hidden away by some kind of collapsable panel.
  * When this action is clicked, a modal should appear and accept inputs from users for 
    1) The size of the textarea
    2) The code in the textarea 
    3) The font size of the text in `em` as a decimal 
* The code entered should have whitespace preserved when displayed on screen
* The code should also be syntax highlighted appropriately to the language being chosen:
  * Valid languages are C, Python, Javascript
  * This element should be able to distinguish between different programming languages based on the input automatically

#### 2.3.5. 🙉🙉🙉 Making elements movable

* For all of `2.3.1`, `2.3.2`, `2.3.3`, `2.3.4`, and `2.3.5`, change it so that:
  * When you double click on a block, it no longer displays the position as an option to edit the location of the block
  * When you click on a block once, each of the 4 corners should now have a small `5px` x `5px` solid box on it, whereby:
    * If the user clicks and drags the box, they can change the position of the box (maintaining aspect ratio).
    * The block cannot have any of its corners extend beyond the edges of the slide.

#### 2.3.6. 🙉🙉🙉 Making elements resizable

* For all of `2.3.1`, `2.3.2`, `2.3.3`, `2.3.4`, and `2.3.5`, change it so that:
  * When you double click on a block, it no longer displays the position as an option to edit the size of the block
  * When you click on a block once, each of the 4 corners should now have a small `5px` x `5px` solid box on it, whereby:
    * If the user clicks and drags the corners, they can increase or decrease the size of the box (maintaining aspect ratio).
    * The block cannot be resized smaller than `1%` of width or height.
    * The block cannot have any of its corners extend beyond the edges of the slide.

### 2.4. Feature Set 4. Further Features

#### 2.4.1. Font adjustment

* For each text box on the slide, on the slideshow edit screen, the user should be able to change its `font-family`.

#### 2.4.2. Theme and background picker

* There should be a button, visible on all slides, when users click on it and it brings up a modal.
* In this modal, you can specify both:
  * The current slide's background in one solid colour, or in a colour gradient; 
  * The default background solid colour or colour gradient of all slides
    * This is the colour that a slide background is set to by default instead of white.

  Note: Free to choose from different gradient directions(E.G. top to down/left to right). It's fully up to you to design a UI that allow users to choose different background options and colours

#### 2.4.3. Preview viewing

* Each slideshow deck should have a button somewhere (immediately visible or behind a panel) that users can click to preview the presentation
* Previewing the presentation simply opens another tab/window where:
  * The slideshow deck is visible to the full size of the screen in your browser
  * The arrow controls and slide numbers are still visible and functional, clicking on the arrows should display the previous/next slide accordingly.
  * Each block should have no border around it.

#### 2.4.4. URL Updating

* For both editing a slideshow deck and previewing presentation, when on a particular slide, the slide number should be reflected in the URL such that if the page is refreshed or URL is shared, it rediects other users to that exact same slide.
 
#### 2.4.5. 🙉🙉🙉Slide transitioning

* Add at least one form of animation when transitioning between slides in the slideshow deck. Examples of this may be:
  * Swipe left/right
  * Fade in and out or cross-fade

#### 2.4.6. 🙉🙉🙉Slide Re-arranging

* A button should be accessible on every slideshow deck (either immediately, or behind a control panel) that brings up the slide re-arrange screen.
* The slide re-arrange screen should display every slide as a rectangle, where each slide has a number inside it to indicate the index of the slide among all slides.
* The rectangles should be sized such that they can all fit on the viewport (assuming less than 10 slides).
* Users can click and drag a particular slide and drop it between another two slides to re-arrange it.
* There is a close button to exit this screen.

#### 2.4.7. 🙉🙉🙉Revision History

* A button should be accessible on every slideshow deck (either immediately, or behind a control panel) that brings up the version history page.
* This should show a list of moments in history such that users can "restore", which restores all slides in the deck to a previous state.
* These previous state moments should be captured by you on every modification of the slideshow deck that occurs with a minimum of 1 minute between saves.

### 2.6. Linting

* Linting must be run from inside the `frontend` folder by running `npm run lint`.

If you would like to disable linting checks during hot reload (and just use the check on command line), then in `frontend/package.json` replace `react-scripts start` with `ESLINT_NO_DEV_ERRORS='true'; react-scripts start`. Note: This does not work on windows machines.

### 2.7. Testing

As part of this project, you are required to write some tests for project components (component testing) and for the application as a whole (UI testing).

#### **Component Testing**:
* Write tests for different components.
* For each of the components, they must not have more than 50% similarity (e.g., you can't test a "Card" component and a "BigCard" component, which are virtually the same).
* Ensure your tests have excellent **coverage** (look at all different use cases and edge cases).
* Ensure your tests have excellent **clarity** (well-commented and the code isn't overly complex).
* Ensure your tests are **designed** well (logical ordering of tests, avoid any tests that aren't necessary or don't add any meaningful value).
* (Only use shallow component rendering)

Use methods discussed in lectures for component testing, or use `cypress`.

#### **UI Testing**:
* Write a test for the "happy path" of an admin that is described as:
   1. Registers successfully.
   2. Creates a new presentation successfully.
   3. Updates the thumbnail and name of the presentation successfully.
   4. Deletes a presentation successfully.
   5. Adds some slides in a slideshow deck successfully.
   6. Switches between slides successfully.
   7. Logs out of the application successfully.
   8. Logs back into the application successfully.
 
#### Advice for Component Testing
 * Find a simple primitive component you've written, and if you don't have one, write one. This could include a common button you use, or a popup, or a box, or an input. Often examples of these are just MUI or other library components you might have wrapped slightly and includes some props you've passed in
 * Simply write some unit tests that check that for a given prop input, the component behaves in a certain way (e.g. action or visual display), etc etc
 * E.G. Creating a `MyButton` that wraps a MUI `Button`.
 * E.G. A simple example is the list of answers for a question. It takes in the answers list we've defined and renders a bunch of MUI ListItems, Checkboxes, TextFields and IconButtons
 * Your app is going to be a set of pages, and those pages are made up of primitive components. But if you don't have layers of components between that it means your code is not well modularised. Another example could be if we said to you - no component should be longer than 50 lines of code. You'd probably go refactor to group common sets of primitives together into a new component.

#### Advice for UI Testing
 * For cypress, consider adding `cy.wait(1000)` if necessary to add slight pauses in your tests if you find that the page is rendering slower than cypress is trying to test.
 * If you're having issues using Cypress on WSL2, try following [this guide](https://shouv.medi
  
#### Other advice / help
* You are welcome to use `enzyme` for testing if you prefer - as long as everything works by running `npm run test`.
* One helpful topic is [mocking fetch calls with jest](https://medium.com/fernandodof/how-to-mock-fetch-calls-with-jest-a666ae1e7752).
* The system will use a reset backend when running `npm run test`.
* If you encounter `enzyme adapter` compatibility issues, you can either:
  * Use this unofficial React 17 adapter: [https://www.npmjs.com/package/@wojtekmaj/enzyme-adapter-react-17](https://www.npmjs.com/package/@wojtekmaj/enzyme-adapter-react-17); or
  * Downgrade `react` and `react-dom` to 16, although this could break other dependencies.

#### Running tests

Tests must be run from inside the `frontend` folder by running `npm run test`. Then you might need to press `a` to run all tests.

You are welcomed to modify the `npm run test` command by updating the `test` script inside `frontend/package.json`. For example, if you would like to run standard react testing alongside cypress UI tests you can use `react-scripts test —watchAll=false && npm run cypress open` and if you've used cypress for both component and UI test, then you can replace that line with `cypress open`.

### 2.8. Other notes
* The port you can use to `fetch` data from the backend is defined in `frontend/src/config.json`
* [This article may be useful to some students](https://stackoverflow.com/questions/66284286/react-jest-mock-usenavigate)
* For users of typescript, [follow this guide](https://gitlab.cse.unsw.edu.au/COMP6080/NOW/react-typescript)
* For certain requests you may want to "poll" the backend, i.e. have the friend end repeatedly make an API call every 1 second to check for updates.

**Note:** You may need to log in with the UNSW student account and be enrolled in the Web Development course to access these materials. However, you can also find relevant topics on platforms like YouTube or Bilibili to supplement my learning.


### 3.1. Frontend

Navigate to the `frontend` folder and run `npm install` to install all the dependencies required to run the ReactJS app. Then run `npm start` to start the ReactJS app.

<!-- Some properties that the backend accepts are defined as empty objects. These objects can be defined by you, as the backend simply stores your object on certain routes and returns it on others (i.e., the backend doesn't need to understand the schema of some objects you pass it). The property of interest is the `questions` component. It will appear as an empty object in the backend API, but you will need to define it. -->

### 3.2. Backend

The backend server is located in your individual repository. After cloning this repo, you must run `npm install` in the `backend` directory once.

To run the backend server, simply run `npm start` in the `backend` directory. This will start the backend.

To view the backend API interface, navigate to the base URL of the backend (e.g., `http://localhost:5005`). This will list all the HTTP routes you can interact with.

The backend is persistent in terms of data storage, meaning the data will remain even after the express server stops running. If you want to reset the data to its original state, you can run `npm run reset` in the backend directory. If you want to back up the backend data, simply copy the `database.json` file. If you want to start with an empty database, you can run `npm run clear` in the backend directory.

Once the backend has started, you can view the API documentation by navigating to `http://localhost:[port]` in a web browser.

The port that the backend runs on (and that the frontend can use) is specified in `frontend/src/config.js`. You can change the port in this file. This file exists so that your frontend knows which port to use when communicating with the backend.


## 4. Constraints & Assumptions

### 4.1. Languages

 * This project must be implemented using ReactJS. Other declarative frameworks such as Angular or Vue cannot be used.
 * ReactJS solutions should be used wherever possible, and direct DOM manipulation should be avoided unless absolutely necessary.
 * Any CSS and UI libraries may be used, such as react-bootstrap or material-ui.
 * Any libraries available via `npm install` may be used, and changes to the `package.json` file must be committed.

### 4.2. Browser Compatibility
 * The program must be tested on one of the following two browsers:
   * Locally, Google Chrome (across various operating systems) – ensure it is the latest version.

### 4.3. Other Requirements
 * The project specification is intentionally broad, allowing developers to build the visual appearance of frontend components as they see fit. The size, positioning, color, and layout of components are almost entirely up to the developer. We require some basic criteria, mainly dictating elements and behavior.
 * Other npm libraries, beyond those described, may be used.
 * Do not use universal CSS; you must use either CSS libraries (e.g., material-ui) or [styled components](https://styled-components.com/docs/basics).


### 5. Acknowledgement

I would like to express my sincere gratitude to the web development course I took during my undergraduate studies at UNSW. The materials and knowledge provided during this course have been instrumental in helping me develop this project. The foundational skills and best practices I gained through the course have guided me throughout the development process, and I am deeply thankful for the support provided by the course content, lectures, and resources.
