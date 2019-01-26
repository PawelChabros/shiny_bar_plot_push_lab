library(forcats)
library(shiny)
library(dplyr)
library(r2d3)
library(DT)

data <-
  read.csv('data.csv') %>%
  as_tibble()

ui <- fluidPage(
  theme = 'style.css',
  titlePanel('Bar plot with totals and repeling labels'),
  sidebarLayout(
    sidebarPanel(
      h3('Filters'),
      checkboxGroupInput(
        inputId = 'group',
        label = 'Group',
        choices = data$group %>% unique(),
        selected = data$group %>% unique()
      ),
      checkboxGroupInput(
        inputId = 'type',
        label = 'Type',
        choices = data$type %>% unique(),
        selected = data$type %>% unique()
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
      mutate(n = if_else(group %in% input$group & type %in% input$type, n, 0L)) %>%
      select(-type) %>%
      group_by(year, group) %>%
      summarise_all(sum) %>%
      ungroup() %>%
      mutate(group = group %>% fct_rev())
  })
  
  output$plot <- renderD3({
    r2d3(
      data = data_filtered(),
      script = 'bar.js'
    )
  })

}

shinyApp(ui = ui, server = server)

