context('Appl flow - Happy path', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  it('Successfully registers', () => {
    const name = 'test'
    const email = 'test@test.com'
    const password = 'password'

    // Switch from login for to register form
    cy.get('a[name=register]')
      .click()

    // Assert we are at the signup form now
    cy.get('[data-test-target=SignUp]').then(el => {
      expect(el.text()).to.contain('Sign Up')
    })

    // Fill out register form
    cy.get('input[name=name]')
      .focus()
      .type(name)

    cy.get('input[name=email]')
      .focus()
      .type(email)

    cy.get('input[name=password]')
      .focus()
      .type(password)

    cy.get('input[name=confirm]')
      .focus()
      .type(password)

    // Submit register form
    cy.get('button[type=submit]')
      .click()

    // Assert we logged in correctly by ensuring we are at the dashboard
    cy.get('[data-test-target=DashboardText]').then(el => {
      expect(el.text()).to.contain('Dashboard')
    })

    // Press the new quiz button
    cy.get('button[name=new]')
      .click()

    // Assert the quiz was created by confirming the existance of the start button, then click it to start
    cy.get('button[name=start]').then(el => {
      expect(el.text()).to.contain('Start Quiz')
    })
      .click()

    // Assert the modal opened by confirming the existance of the instruciton text
    cy.get('[data-test-target=link]').then(el => {
      expect(el.text()).to.contain('Copy session link:')
    })

    // Click the copy button to close the modal
    cy.get('button[name=copy]')
      .click()

    // Click the button to enter the run game screen
    cy.get('[name="open"]')
      .click()

    // Assert that we succesfully got to the run game screen by confirming the existance of the stop button, then click it
    cy.get('[name="stop"]').then(el => {
      expect(el.text()).to.contain('Stop Quiz')
    })
      .click()

    // Assert the modal opened by confirming the existance of the instruciton text
    cy.get('[data-test-target=view]').then(el => {
      expect(el.text()).to.contain('View results?')
    })

    // Click the button to view results
    cy.get('[name="results"]')
      .click()

    // Confirm we made it to the results screen by confirming the existance of the page title
    cy.get('[data-test-target=results]').then(el => {
      expect(el.text()).to.contain('Results')
    })

    // Click the sign out button to sign out
    cy.get('button[name="sign-out"]')
      .click()

    // Assert we are at the sign in form now
    cy.get('[data-test-target=SignIn]').then(el => {
      expect(el.text()).to.contain('Sign in')
    })

    cy.get('input[name=email]')
      .focus()
      .type(email)

    cy.get('input[name=password]')
      .focus()
      .type(password)

    cy.get('button[type=submit]')
      .click()

    // Assert we logged in correctly by ensuring we are at the dashboard
    cy.get('[data-test-target=DashboardText]').then(el => {
      expect(el.text()).to.contain('Dashboard')
    })
  })
})