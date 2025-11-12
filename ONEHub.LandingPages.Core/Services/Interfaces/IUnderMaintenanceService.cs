using ONEHub.LandingPages.Core.Models;

namespace ONEHub.LandingPages.Core.Services.Interfaces;

public interface IUnderMaintenanceService
{
    Task<ScheduleMaintenance> GetUnderMaintenanceInfoAsync();

    Task<ScheduleMaintenance> SyncUnderMaintenanceInfoAsync();

    Task<bool> GetIsUnderMaintenanceByDomainAsync(string domain);
}
