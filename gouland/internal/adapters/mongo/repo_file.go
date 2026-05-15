package mongoadapter

import (
"context"
"fmt"
"time"

"gouland/internal/domain"
"gouland/internal/ports"

"go.mongodb.org/mongo-driver/bson"
"go.mongodb.org/mongo-driver/bson/primitive"
"go.mongodb.org/mongo-driver/mongo/options"
)

type FileRepoMongo struct{ m *Mongo }

func NewFileRepo(m *Mongo) ports.FileRepo { return &FileRepoMongo{m: m} }

func (r *FileRepoMongo) coll() string { return "files" }

func (r *FileRepoMongo) GetByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]domain.File, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
filter := bson.M{"$and": bson.A{bson.M{"file_id_order": orderID}, bson.M{"file_status": "1"}}}
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, filter)
if err != nil {
return nil, fmt.Errorf("find files: %w", err)
}
defer cur.Close(ctx)
var out []domain.File
for cur.Next(ctx) {
var f domain.File
if err := cur.Decode(&f); err != nil {
return nil, err
}
out = append(out, f)
}
return out, nil
}

func (r *FileRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.File, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var f domain.File
if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&f); err != nil {
return nil, fmt.Errorf("find file: %w", err)
}
return &f, nil
}

func (r *FileRepoMongo) Create(ctx context.Context, f *domain.File) error {
f.ID = primitive.NewObjectID()
if f.FileStatus == "" {
f.FileStatus = "1"
}
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, f)
return err
}

func (r *FileRepoMongo) Update(ctx context.Context, id primitive.ObjectID, f *domain.File) (*domain.File, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
update := bson.M{"$set": bson.M{
"file_name":      f.FileName,
"file_name_user": f.FileNameUser,
"file_size":      f.FileSize,
"file_status":    f.FileStatus,
"file_encode":    f.FileEncode,
}}
opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
var result domain.File
err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOneAndUpdate(ctx, bson.M{"_id": id}, update, opts).Decode(&result)
if err != nil {
return nil, err
}
return &result, nil
}

func (r *FileRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
return err
}
