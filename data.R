data <- read.csv('Zeszyt1.csv', sep = ';') %>%
  as_tibble() %>%
  gather(typ, n, -Rok) %>%
  mutate(plt = if_else(
    typ %in% c('akademickie', 'zawodowe'),
    'plt2',
    'plt1'
  ))
