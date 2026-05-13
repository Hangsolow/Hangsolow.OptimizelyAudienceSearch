var builder = DistributedApplication.CreateBuilder(args);
var sqlPasswordDefault = new GenerateParameterDefault();
var sqlPassword = builder.AddParameter("sql-password", sqlPasswordDefault, secret: true, persist: true);
var cmsPassword = builder.AddParameter("cms-password", sqlPasswordDefault, secret: true, persist: true);
var sql = builder.AddSqlServer("sql", password: sqlPassword)
    .WithDataBindMount("obj/sql-data")
    .WithLifetime(ContainerLifetime.Persistent);

var db = sql.AddDatabase("EPiServerDB", "AlloySample");

builder.AddProject<Projects.AlloySample>("web")
    .WithReference(db)
    .WaitFor(db);

builder.Build().Run();
