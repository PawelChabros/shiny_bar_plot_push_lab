library(forcats)
library(shiny)
library(dplyr)
library(r2d3)
library(DT)

data <- read.csv('Zeszyt1.csv', sep = ';') %>%
  as_tibble()

ui <- fluidPage(
  
  titlePanel('Rodzaje uczelni wyższych'),
  sidebarLayout(
    sidebarPanel(
      h3('Filtry uczelni'),
      checkboxGroupInput(
        inputId = 'rodzajUcz',
        label = 'Rodzaj uczelni',
        choices = c('publiczna', 'niepubliczna', 'kościelna'),
        selected = c('publiczna', 'niepubliczna', 'kościelna')
      ),
      checkboxGroupInput(
        inputId = 'profilUcz',
        label = 'Profil uczelni',
        choices = c('akademicka', 'zawodowa'),
        selected = c('akademicka', 'zawodowa')
      ),
      radioButtons(
        inputId = 'typ',
        label = 'Kategorie wykresu',
        choices = c('rodzaj', 'profil')
      )
    ),
    mainPanel(
      d3Output('plot')
    )
  )
)

server <- function(input, output) {

  data_filtered <- reactive({
    data %>%
      mutate(n = if_else(rodzaj %in% input$rodzajUcz & profil %in% input$profilUcz, n, 0L)) %>%
      select(Rok, input$typ, label, n) %>%
      rename_at(2, ~'typ') %>%
      group_by(Rok, typ, label) %>%
      summarise_at(4, sum) %>%
      ungroup() %>%
      mutate(typ = typ %>% fct_rev()) %>%
      arrange(typ)
  })
  
  output$plot <- renderD3({
    r2d3(
      data = data_filtered(),
      script = 'bar.js'
    )
  })

}

shinyApp(ui = ui, server = server)

