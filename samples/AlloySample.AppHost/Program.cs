var builder = DistributedApplication.CreateBuilder(args);

var sqlPassword = builder.AddParameter("sql-password", secret: true);

var sql = builder.AddSqlServer("sql", password: sqlPassword)
    .WithDataBindMount(Path.Combine(builder.AppHostDirectory, "..", "AlloySample", "App_Data"))
    .WithLifetime(ContainerLifetime.Persistent);

var db = sql.AddDatabase("EPiServerDB", "AlloySample");

builder.AddProject<Projects.AlloySample>("web")
    .WithReference(db)
    .WaitFor(db);

builder.Build().Run();
