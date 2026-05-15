package usecase

import (
"context"
"strconv"
"strings"
"time"

"gouland/internal/domain"
"gouland/internal/ports"
)

type SearchUsecase interface {
SearchAll(ctx context.Context, q string) (map[string]interface{}, error)
GetPedido(ctx context.Context, idcab string) (map[string]interface{}, error)
GetColeccion(ctx context.Context, tabla string, idcab string) (map[string]interface{}, error)
GetOrdersFiltered(ctx context.Context, roleAgente, idAgente, fini, ffin, nameContact, tm string) (map[string]interface{}, error)
GetOrdersByMes(ctx context.Context, idAgente string) (map[string]interface{}, error)
GetCuentaTM(ctx context.Context, idAgente string) (map[string]interface{}, error)
GetCuentaTMs(ctx context.Context) (map[string]interface{}, error)
}

type searchUsecase struct {
order   ports.OrderRepo
pax     ports.PassengerRepo
country ports.CountryRepo
}

func NewSearchUsecase(or ports.OrderRepo, pr ports.PassengerRepo, cr ports.CountryRepo) SearchUsecase {
return &searchUsecase{order: or, pax: pr, country: cr}
}

func (s *searchUsecase) SearchAll(ctx context.Context, q string) (map[string]interface{}, error) {
res := make(map[string]interface{})
if o, err := s.order.Search(ctx, "contact_person_name", q); err == nil {
res["order"] = o
} else {
res["order"] = []interface{}{}
}
if p, err := s.pax.Search(ctx, "pax_first_name", q); err == nil {
res["passenger"] = p
} else {
res["passenger"] = []interface{}{}
}
if c, err := s.country.Search(ctx, "name", q); err == nil {
res["country"] = c
} else {
res["country"] = []interface{}{}
}
return res, nil
}

func (s *searchUsecase) GetPedido(ctx context.Context, idcab string) (map[string]interface{}, error) {
oid := domain.HexToObjectID(idcab)
order, _ := s.order.GetByID(ctx, oid)
passengers, _ := s.pax.GetByOrderID(ctx, oid)
// Node.js usa Order.find() que retorna array, replicamos ese comportamiento
orders := []interface{}{}
if order != nil {
orders = append(orders, order)
}
return map[string]interface{}{"ok": true, "order": orders, "passengers": passengers}, nil
}

func (s *searchUsecase) GetColeccion(ctx context.Context, tabla string, idcab string) (map[string]interface{}, error) {
oid := domain.HexToObjectID(idcab)
switch tabla {
case "order":
data, err := s.order.GetByID(ctx, oid)
if err != nil {
return map[string]interface{}{"ok": false, "mensaje": "Error al cargar la info de la Order"}, err
}
return map[string]interface{}{"ok": true, "order": data}, nil
case "pasajeros":
data, err := s.pax.GetByOrderID(ctx, oid)
if err != nil {
return map[string]interface{}{"ok": false, "mensaje": "Error al cargar la info de los Pasajeros"}, err
}
return map[string]interface{}{"ok": true, "pasajeros": data}, nil
default:
return map[string]interface{}{"ok": false, "mensaje": "solo order y seller"}, nil
}
}

func (s *searchUsecase) GetOrdersFiltered(ctx context.Context, roleAgente, idAgente, fini, ffin, nameContact, tm string) (map[string]interface{}, error) {
finiT, _ := time.Parse("2006-01-02", fini)
ffinT, _ := time.Parse("2006-01-02", ffin)
ids := parseAgentIDs(idAgente)
filter := ports.OrderFilter{
AgentIDs:    ids,
RoleAgente:  roleAgente,
FIni:        finiT,
FFin:        ffinT,
NameContact: nameContact,
TmCode:      tm,
}
orders, err := s.order.FindFiltered(ctx, filter)
if err != nil {
return map[string]interface{}{"ok": false}, err
}
return map[string]interface{}{"ok": true, "orders": orders, "cant": len(orders)}, nil
}

func (s *searchUsecase) GetOrdersByMes(ctx context.Context, idAgente string) (map[string]interface{}, error) {
ids := parseAgentIDs(idAgente)
data, err := s.order.AggregateByMonth(ctx, ids)
if err != nil {
return nil, err
}
return map[string]interface{}{"ok": true, "orders": data}, nil
}

func (s *searchUsecase) GetCuentaTM(ctx context.Context, idAgente string) (map[string]interface{}, error) {
ids := parseAgentIDs(idAgente)
data, err := s.order.CountByTMDate(ctx, ids)
if err != nil {
return nil, err
}
return map[string]interface{}{"ok": true, "cuenta": data}, nil
}

func (s *searchUsecase) GetCuentaTMs(ctx context.Context) (map[string]interface{}, error) {
data, err := s.order.FindWithTMDate(ctx)
if err != nil {
return nil, err
}
return map[string]interface{}{"ok": true, "cuenta": data}, nil
}

func parseAgentIDs(idAgente string) []int {
parts := strings.Split(idAgente, "-")
var ids []int
for _, p := range parts {
if n, err := strconv.Atoi(p); err == nil {
ids = append(ids, n)
}
}
return ids
}
