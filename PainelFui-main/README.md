# PainelFui

O painel fui é um sistema interno que desenvolvi com auxilio de um colega de trabalho que me ajudou com a parte do backend.
Esse sistema tem como função primaria, saber exatamente onde cada colaborador está, dentro do predio do hcfmb (lugar onde trabalho atualmente).

Basicamente, a cada 60 minutos, um select é rodada em um banco de dados Oracle, que traz as informações para montar o arquivo HTML com todas as informações que precisamos. Como : 
nome de todos, foto, se é o plantonista do dia ou não, se a pessoa se encontra em sua mesa, etc...

Os estilos e o Javascript são definidos separadamente da página html principal. 
