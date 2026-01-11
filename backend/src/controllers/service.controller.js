import serviceService from "../service/service.service.js";
import { sendSuccess, sendCreated } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class ServiceController {
      createService = asyncHandler(async (req, res) => {
            const serviceData = req.body;
            const icon = req.files?.icon?.[0];

            const service = await serviceService.createService(serviceData, icon);
            sendCreated(res, "Service created successfully", service);
      });

      getAllServices = asyncHandler(async (req, res) => {
            const services = await serviceService.getAllServices();
            sendSuccess(res, "Services retrieved successfully", services);
      });

      getServiceById = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const service = await serviceService.getServiceById(id);
            sendSuccess(res, "Service retrieved successfully", service);
      });

      updateService = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const serviceData = req.body;
            const icon = req.files?.icon?.[0];

            const service = await serviceService.updateService(id, serviceData, icon);
            sendSuccess(res, "Service updated successfully", service);
      });

      deleteService = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await serviceService.deleteService(id);
            sendSuccess(res, "Service deleted successfully", result);
      });

      getAllServicesAdmin = asyncHandler(async (req, res) => {
            const services = await serviceService.getAllServicesAdmin();
            sendSuccess(res, "All services retrieved successfully", services);
      });
}

export default new ServiceController();


