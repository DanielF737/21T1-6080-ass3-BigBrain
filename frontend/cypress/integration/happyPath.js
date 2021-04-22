context('Appl flow - Happy path', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  it('Successfully registers', () => {
    const name = 'test'
    const email = 'test@test.com'
    const password = 'password'

    cy.get('a[name=register]')
      .click()

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

    cy.get('button[type=submit]')
      .click()

    cy.get('button[name=new]')
      .click()

    cy.get('button[name=start]')
      .click()

    cy.get('button[name=copy]')
      .click()

    cy.get('[name="open"]')
      .click()

    cy.get('[name="stop"]')
      .click()
      
    cy.get('[name="results"]')
      .click()

    cy.get('button[name="sign-out"]')
      .click()

    cy.get('input[name=email]')
      .focus()
      .type(email)

    cy.get('input[name=password]')
      .focus()
      .type(password)

    cy.get('button[type=submit]')
      .click()
  })
})