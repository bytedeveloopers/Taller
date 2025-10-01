"use client";

import VehiculosEnTallerSection from "@/components/admin/sections/VehiculosEnTallerSection";
import CameraComponent from "@/components/ui/CameraComponent";
import { useToast } from "@/components/ui/ToastNotification";
import {
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";

// Función para generar códigos de seguimiento únicos
const generarCodigoSeguimiento = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `TLR-${año}${mes}${dia}-${hora}${minuto}-${random}`;
};

interface FotoInspeccion {
  id: string;
  nombre: string;
  ubicacion: string;
  observacion: string;
  timestamp: string;
  tecnico: string;
  tieneDano: boolean;
  url?: string; // Para la imagen real cuando se implemente
}

interface CheckIn {
  id: number;
  codigoSeguimiento: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  tecnico: string;
  hora: string;
  telefono: string;
  email: string;
  observaciones: string;
  firmaDigital: boolean;
  evidencias: number;
  fotosInspeccion: FotoInspeccion[];
  datosVerificados: boolean;
  estado: "pendiente" | "validado" | "rechazado";
}

interface Props {
  stats: any;
}

export default function RecepcionSection({ stats }: Props) {
  const { showSuccess, showError, showWarning } = useToast();
  const [checkInsPendientes, setCheckInsPendientes] = useState<CheckIn[]>([]);
  const [checkInsValidados, setCheckInsValidados] = useState<CheckIn[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [showEvidencias, setShowEvidencias] = useState(false);
  const [showAgregarFoto, setShowAgregarFoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<FotoInspeccion | null>(null);
  const [showVehiculosEnTaller, setShowVehiculosEnTaller] = useState(false);
  const [showCrearOTModal, setShowCrearOTModal] = useState(false);
  const [nuevaFoto, setNuevaFoto] = useState({
    ubicacion: "",
    observacion: "",
    tieneDano: false,
  });
  const [nuevaOT, setNuevaOT] = useState({
    cliente: "",
    telefono: "",
    email: "",
    vehiculo: "",
    marca: "",
    modelo: "",
    año: "",
    placa: "",
    color: "",
    kilometraje: "",
    observaciones: "",
    servicios: [] as string[],
    prioridad: "media" as "baja" | "media" | "alta" | "urgente",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Inicializar datos de ejemplo
  useEffect(() => {
    const mockPendientes: CheckIn[] = [
      {
        id: 1,
        codigoSeguimiento: "TLR-20241227-0930-ABC",
        cliente: "Juan Pérez",
        vehiculo: "Honda Civic 2018",
        placa: "P123ABC",
        tecnico: "Carlos López",
        hora: "09:30",
        telefono: "+506 8888-9999",
        email: "juan.perez@email.com",
        observaciones: "Cliente reporta ruido extraño en el motor",
        firmaDigital: true,
        evidencias: 8,
        fotosInspeccion: [
          {
            id: "1-1",
            nombre: "Frontal Completo",
            ubicacion: "Parte frontal del vehículo",
            observacion: "Sin daños aparentes",
            timestamp: "09:35",
            tecnico: "Carlos López",
            tieneDano: false,
          },
          {
            id: "1-2",
            nombre: "Lateral Derecho",
            ubicacion: "Costado derecho completo",
            observacion: "Rayón profundo en puerta trasera derecha",
            timestamp: "09:37",
            tecnico: "Carlos López",
            tieneDano: true,
          },
          {
            id: "1-3",
            nombre: "Trasero Completo",
            ubicacion: "Parte trasera del vehículo",
            observacion: "Golpe menor en paragolpes trasero lado derecho",
            timestamp: "09:39",
            tecnico: "Carlos López",
            tieneDano: true,
          },
          {
            id: "1-4",
            nombre: "Lateral Izquierdo",
            ubicacion: "Costado izquierdo completo",
            observacion: "Estado excelente, sin daños",
            timestamp: "09:41",
            tecnico: "Carlos López",
            tieneDano: false,
          },
          {
            id: "1-5",
            nombre: "Capó y Motor",
            ubicacion: "Capó abierto y compartimento motor",
            observacion: "Ligero desgaste en pintura del capó",
            timestamp: "09:43",
            tecnico: "Carlos López",
            tieneDano: true,
          },
          {
            id: "1-6",
            nombre: "Interior General",
            ubicacion: "Cabina y asientos",
            observacion: "Interior limpio, asientos en buen estado",
            timestamp: "09:45",
            tecnico: "Carlos López",
            tieneDano: false,
          },
          {
            id: "1-7",
            nombre: "Llantas Delanteras",
            ubicacion: "Ruedas frontales",
            observacion: "Llantas en buen estado, 70% vida útil",
            timestamp: "09:47",
            tecnico: "Carlos López",
            tieneDano: false,
          },
          {
            id: "1-8",
            nombre: "Llantas Traseras",
            ubicacion: "Ruedas posteriores",
            observacion: "Desgaste normal, 65% vida útil",
            timestamp: "09:49",
            tecnico: "Carlos López",
            tieneDano: false,
          },
        ],
        datosVerificados: true,
        estado: "pendiente",
      },
      {
        id: 2,
        codigoSeguimiento: "TLR-20241227-1015-DEF",
        cliente: "María García",
        vehiculo: "Toyota Corolla 2020",
        placa: "P456DEF",
        tecnico: "Ana Rodríguez",
        hora: "10:15",
        telefono: "+506 7777-8888",
        email: "maria.garcia@email.com",
        observaciones: "Mantenimiento preventivo programado",
        firmaDigital: true,
        evidencias: 6,
        fotosInspeccion: [
          {
            id: "2-1",
            nombre: "Vista Frontal",
            ubicacion: "Frente completo",
            observacion: "Excelente estado, sin daños",
            timestamp: "10:20",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
          {
            id: "2-2",
            nombre: "Lateral Derecho",
            ubicacion: "Costado derecho",
            observacion: "Perfecto estado",
            timestamp: "10:22",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
          {
            id: "2-3",
            nombre: "Vista Trasera",
            ubicacion: "Parte posterior",
            observacion: "Sin daños, excelente",
            timestamp: "10:24",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
          {
            id: "2-4",
            nombre: "Lateral Izquierdo",
            ubicacion: "Costado izquierdo",
            observacion: "Estado impecable",
            timestamp: "10:26",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
          {
            id: "2-5",
            nombre: "Interior",
            ubicacion: "Cabina del vehículo",
            observacion: "Interior como nuevo",
            timestamp: "10:28",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
          {
            id: "2-6",
            nombre: "Llantas",
            ubicacion: "Las cuatro ruedas",
            observacion: "Llantas nuevas, excelente estado",
            timestamp: "10:30",
            tecnico: "Ana Rodríguez",
            tieneDano: false,
          },
        ],
        datosVerificados: false,
        estado: "pendiente",
      },
      {
        id: 3,
        codigoSeguimiento: "TLR-20241227-1100-GHI",
        cliente: "Pedro Martínez",
        vehiculo: "Nissan Sentra 2019",
        placa: "P789GHI",
        tecnico: "Juan Pérez",
        hora: "11:00",
        telefono: "+506 6666-7777",
        email: "pedro.martinez@email.com",
        observaciones: "Problemas con el sistema de frenos",
        firmaDigital: false,
        evidencias: 4,
        fotosInspeccion: [
          {
            id: "3-1",
            nombre: "Frente del Vehículo",
            ubicacion: "Parte frontal",
            observacion: "Estado general bueno",
            timestamp: "11:05",
            tecnico: "Juan Pérez",
            tieneDano: false,
          },
          {
            id: "3-2",
            nombre: "Capó",
            ubicacion: "Capó del motor",
            observacion: "Desgaste leve en pintura, varios puntos de oxidación menor",
            timestamp: "11:07",
            tecnico: "Juan Pérez",
            tieneDano: true,
          },
          {
            id: "3-3",
            nombre: "Puerta Conductor",
            ubicacion: "Puerta lateral izquierda",
            observacion: "Pequeño rayón vertical cerca de la manija",
            timestamp: "11:09",
            tecnico: "Juan Pérez",
            tieneDano: true,
          },
          {
            id: "3-4",
            nombre: "Ruedas Delanteras",
            ubicacion: "Llantas frontales",
            observacion: "Desgaste irregular en llanta derecha",
            timestamp: "11:11",
            tecnico: "Juan Pérez",
            tieneDano: true,
          },
        ],
        datosVerificados: true,
        estado: "pendiente",
      },
    ];

    const mockValidados: CheckIn[] = [
      {
        id: 4,
        codigoSeguimiento: "TLR-20241227-0845-CBA",
        cliente: "Ana Jiménez",
        vehiculo: "Hyundai Elantra 2021",
        placa: "P321CBA",
        tecnico: "Luis Mora",
        hora: "08:45",
        telefono: "+506 5555-6666",
        email: "ana.jimenez@email.com",
        observaciones: "Cambio de aceite y filtros",
        firmaDigital: true,
        evidencias: 7,
        fotosInspeccion: [
          {
            id: "4-1",
            nombre: "Vista General Frontal",
            ubicacion: "Frente completo",
            observacion: "Vehículo prácticamente nuevo",
            timestamp: "08:50",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-2",
            nombre: "Lado Derecho",
            ubicacion: "Lateral derecho completo",
            observacion: "Sin daños, excelente",
            timestamp: "08:52",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-3",
            nombre: "Parte Trasera",
            ubicacion: "Vista posterior",
            observacion: "Estado impecable",
            timestamp: "08:54",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-4",
            nombre: "Lado Izquierdo",
            ubicacion: "Lateral izquierdo completo",
            observacion: "Perfecto estado",
            timestamp: "08:56",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-5",
            nombre: "Interior Completo",
            ubicacion: "Cabina y asientos",
            observacion: "Interior como nuevo",
            timestamp: "08:58",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-6",
            nombre: "Motor",
            ubicacion: "Compartimento del motor",
            observacion: "Motor limpio, bien mantenido",
            timestamp: "09:00",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
          {
            id: "4-7",
            nombre: "Ruedas y Llantas",
            ubicacion: "Las cuatro ruedas",
            observacion: "Llantas nuevas, rines impecables",
            timestamp: "09:02",
            tecnico: "Luis Mora",
            tieneDano: false,
          },
        ],
        datosVerificados: true,
        estado: "validado",
      },
    ];

    setCheckInsPendientes(mockPendientes);
    setCheckInsValidados(mockValidados);
  }, []);

  const validarCheckIn = async (checkInId: number) => {
    setLoading(true);
    try {
      // Simular validación
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const checkIn = checkInsPendientes.find((c) => c.id === checkInId);
      if (checkIn) {
        // Verificar requisitos
        if (!checkIn.datosVerificados) {
          showWarning(
            "Datos Incompletos",
            "Los datos del cliente/vehículo no han sido verificados"
          );
          return;
        }

        if (!checkIn.firmaDigital) {
          showWarning("Firma Requerida", "Se requiere la firma digital del cliente");
          return;
        }

        if (checkIn.fotosInspeccion.length < 4) {
          showWarning(
            "Inspección Visual Incompleta",
            `Se requieren al menos 4 fotos de inspección. Actualmente: ${checkIn.fotosInspeccion.length} fotos`
          );
          return;
        }

        // Mover a validados
        setCheckInsPendientes((prev) => prev.filter((c) => c.id !== checkInId));
        setCheckInsValidados((prev) => [...prev, { ...checkIn, estado: "validado" }]);

        const { tieneDanos } = detectarDanos(checkIn);
        showSuccess(
          "Check-in Validado",
          `OT creada para ${checkIn.cliente}. Inspección 360° completa - ${
            tieneDanos ? "Daños documentados" : "Sin daños detectados"
          }.`
        );
      }
    } catch (error) {
      showError("Error de Validación", "No se pudo validar el check-in. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const rechazarCheckIn = async (checkInId: number) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const checkIn = checkInsPendientes.find((c) => c.id === checkInId);
      if (checkIn) {
        setCheckInsPendientes((prev) => prev.filter((c) => c.id !== checkInId));
        showError("Check-in Rechazado", `Se rechazó la recepción de ${checkIn.cliente}`);
      }
    } catch (error) {
      showError("Error", "No se pudo rechazar el check-in");
    } finally {
      setLoading(false);
    }
  };

  const verEvidencias = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setShowEvidencias(true);
    showSuccess(
      "Inspección Visual Cargada",
      `Mostrando ${checkIn.evidencias} fotos de inspección 360° de ${checkIn.vehiculo} (${checkIn.placa})`
    );
  };

  const crearOTManual = () => {
    setShowCrearOTModal(true);
  };

  const procesarOTManual = async () => {
    if (!nuevaOT.cliente.trim() || !nuevaOT.vehiculo.trim() || !nuevaOT.placa.trim()) {
      showWarning("Campos Requeridos", "Por favor complete al menos cliente, vehículo y placa");
      return;
    }

    setLoading(true);
    try {
      // Simular creación de OT
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generar código de seguimiento
      const codigoSeguimiento = generarCodigoSeguimiento();

      // Crear nuevo check-in directamente validado
      const nuevaOTCompleta: CheckIn = {
        id: Date.now(), // ID temporal
        codigoSeguimiento,
        cliente: nuevaOT.cliente,
        vehiculo: `${nuevaOT.marca} ${nuevaOT.modelo} ${nuevaOT.año}`,
        placa: nuevaOT.placa,
        tecnico: "Asignación Pendiente",
        hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        telefono: nuevaOT.telefono,
        email: nuevaOT.email,
        observaciones: nuevaOT.observaciones,
        firmaDigital: false, // OT manual no requiere firma inicial
        evidencias: 0, // Sin fotos iniciales
        fotosInspeccion: [],
        datosVerificados: true, // Los datos se ingresan manualmente
        estado: "validado", // Directamente validado
      };

      // Agregar a validados
      setCheckInsValidados((prev) => [nuevaOTCompleta, ...prev]);

      // Limpiar formulario
      setNuevaOT({
        cliente: "",
        telefono: "",
        email: "",
        vehiculo: "",
        marca: "",
        modelo: "",
        año: "",
        placa: "",
        color: "",
        kilometraje: "",
        observaciones: "",
        servicios: [],
        prioridad: "media",
      });

      setShowCrearOTModal(false);

      showSuccess(
        "OT Manual Creada",
        `Orden de trabajo creada para ${nuevaOT.cliente}. Código: ${codigoSeguimiento}`
      );
    } catch (error) {
      showError("Error", "No se pudo crear la orden de trabajo");
    } finally {
      setLoading(false);
    }
  };

  const agregarNuevaFoto = async (imageData?: string) => {
    if (!selectedCheckIn || !nuevaFoto.ubicacion.trim()) {
      showWarning("Campos Requeridos", "Por favor complete la ubicación de la foto");
      return;
    }

    setLoading(true);
    try {
      // Simular guardado de foto
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nuevaFotoCompleta: FotoInspeccion = {
        id: `${selectedCheckIn.id}-${Date.now()}`,
        nombre: `Foto ${selectedCheckIn.fotosInspeccion.length + 1}`,
        ubicacion: nuevaFoto.ubicacion,
        observacion: nuevaFoto.observacion || "Sin observaciones adicionales",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        tecnico: selectedCheckIn.tecnico,
        tieneDano: nuevaFoto.tieneDano,
        url: imageData, // Guardar la imagen capturada
      };

      // Actualizar el check-in seleccionado con la nueva foto
      setCheckInsPendientes((prev) =>
        prev.map((checkIn) =>
          checkIn.id === selectedCheckIn.id
            ? {
                ...checkIn,
                fotosInspeccion: [...checkIn.fotosInspeccion, nuevaFotoCompleta],
                evidencias: checkIn.evidencias + 1,
              }
            : checkIn
        )
      );

      // Actualizar también el selectedCheckIn
      setSelectedCheckIn((prev) =>
        prev
          ? {
              ...prev,
              fotosInspeccion: [...prev.fotosInspeccion, nuevaFotoCompleta],
              evidencias: prev.evidencias + 1,
            }
          : null
      );

      // Limpiar formulario
      setNuevaFoto({ ubicacion: "", observacion: "", tieneDano: false });
      setShowAgregarFoto(false);

      showSuccess(
        "Foto Agregada",
        `Nueva foto de "${nuevaFoto.ubicacion}" agregada exitosamente${
          nuevaFoto.tieneDano ? " - Daño documentado" : ""
        }`
      );
    } catch (error) {
      showError("Error", "No se pudo agregar la foto");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    agregarNuevaFoto(imageData);
    setShowCamera(false);
  };

  const abrirCamara = () => {
    if (!nuevaFoto.ubicacion.trim()) {
      showWarning("Ubicación Requerida", "Por favor ingrese la ubicación antes de tomar la foto");
      return;
    }
    setShowCamera(true);
  };

  const handleAgregarFotoManual = () => {
    agregarNuevaFoto();
  };

  const generarReportePDF = async (checkIn: CheckIn) => {
    try {
      setLoading(true);

      const pdf = new jsPDF();
      const fechaActual = new Date().toLocaleDateString("es-ES");

      // Header del documento
      pdf.setFontSize(20);
      pdf.text("REPORTE DE INSPECCIÓN VEHICULAR", 20, 20);

      pdf.setFontSize(12);
      pdf.text(`Fecha: ${fechaActual}`, 20, 35);
      pdf.text(`Código de Seguimiento: ${checkIn.codigoSeguimiento}`, 20, 45);

      // Información del cliente
      pdf.setFontSize(16);
      pdf.text("INFORMACIÓN DEL CLIENTE", 20, 65);

      pdf.setFontSize(12);
      pdf.text(`Cliente: ${checkIn.cliente}`, 20, 80);
      pdf.text(`Teléfono: ${checkIn.telefono}`, 20, 90);
      pdf.text(`Email: ${checkIn.email}`, 20, 100);

      // Información del vehículo
      pdf.setFontSize(16);
      pdf.text("INFORMACIÓN DEL VEHÍCULO", 20, 120);

      pdf.setFontSize(12);
      pdf.text(`Vehículo: ${checkIn.vehiculo}`, 20, 135);
      pdf.text(`Placa: ${checkIn.placa}`, 20, 145);
      pdf.text(`Técnico Asignado: ${checkIn.tecnico}`, 20, 155);
      pdf.text(`Hora de Ingreso: ${checkIn.hora}`, 20, 165);

      // Observaciones
      pdf.setFontSize(16);
      pdf.text("OBSERVACIONES INICIALES", 20, 185);

      pdf.setFontSize(12);
      const observaciones = pdf.splitTextToSize(checkIn.observaciones, 170);
      pdf.text(observaciones, 20, 200);

      // Resumen de inspección
      const { tieneDanos, tiposDanos, totalFotos } = detectarDanos(checkIn);

      pdf.setFontSize(16);
      pdf.text("RESUMEN DE INSPECCIÓN", 20, 230);

      pdf.setFontSize(12);
      pdf.text(`Total de fotos tomadas: ${totalFotos}`, 20, 245);
      pdf.text(
        `Estado general: ${tieneDanos ? "DAÑOS DETECTADOS" : "SIN DAÑOS APARENTES"}`,
        20,
        255
      );

      if (tieneDanos && tiposDanos.length > 0) {
        pdf.text("Daños encontrados:", 20, 270);
        let yPos = 280;
        tiposDanos.forEach((dano, index) => {
          if (yPos > 280) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`• ${dano}`, 25, yPos);
          yPos += 10;
        });
      }

      // Información de fotos
      if (checkIn.fotosInspeccion.length > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("DETALLE DE INSPECCIÓN FOTOGRÁFICA", 20, 20);

        let yPos = 40;
        checkIn.fotosInspeccion.forEach((foto, index) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(14);
          pdf.text(`${index + 1}. ${foto.nombre}`, 20, yPos);
          yPos += 10;

          pdf.setFontSize(12);
          pdf.text(`Ubicación: ${foto.ubicacion}`, 25, yPos);
          yPos += 8;
          pdf.text(`Técnico: ${foto.tecnico}`, 25, yPos);
          yPos += 8;
          pdf.text(`Hora: ${foto.timestamp}`, 25, yPos);
          yPos += 8;
          pdf.text(`Estado: ${foto.tieneDano ? "⚠️ CON DAÑOS" : "✅ SIN DAÑOS"}`, 25, yPos);
          yPos += 8;

          const observacionFoto = pdf.splitTextToSize(`Observación: ${foto.observacion}`, 170);
          pdf.text(observacionFoto, 25, yPos);
          yPos += observacionFoto.length * 6 + 15;
        });
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Página ${i} de ${totalPages}`, 20, 285);
        pdf.text("Generado por Sistema de Gestión Taller AutoRepair", 120, 285);
      }

      // Descargar PDF
      pdf.save(`Reporte_Inspeccion_${checkIn.codigoSeguimiento}.pdf`);

      showSuccess(
        "Reporte Generado",
        `PDF de inspección para ${checkIn.cliente} descargado exitosamente`
      );
    } catch (error) {
      showError("Error", "No se pudo generar el reporte PDF");
      console.error("Error generando PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarFoto = async (fotoId: string) => {
    if (!selectedCheckIn) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Actualizar el check-in seleccionado removiendo la foto
      setCheckInsPendientes((prev) =>
        prev.map((checkIn) =>
          checkIn.id === selectedCheckIn.id
            ? {
                ...checkIn,
                fotosInspeccion: checkIn.fotosInspeccion.filter((foto) => foto.id !== fotoId),
                evidencias: checkIn.evidencias - 1,
              }
            : checkIn
        )
      );

      // Actualizar también el selectedCheckIn
      setSelectedCheckIn((prev) =>
        prev
          ? {
              ...prev,
              fotosInspeccion: prev.fotosInspeccion.filter((foto) => foto.id !== fotoId),
              evidencias: prev.evidencias - 1,
            }
          : null
      );

      showSuccess("Foto Eliminada", "La foto fue eliminada exitosamente");
    } catch (error) {
      showError("Error", "No se pudo eliminar la foto");
    } finally {
      setLoading(false);
    }
  };

  const detectarDanos = (checkIn: CheckIn) => {
    const fotosConDanos = checkIn.fotosInspeccion.filter((foto) => foto.tieneDano);
    const tieneDanos = fotosConDanos.length > 0;
    const tiposDanos = fotosConDanos.map((foto) => `${foto.ubicacion}: ${foto.observacion}`);

    return { tieneDanos, tiposDanos, totalFotos: checkIn.fotosInspeccion.length };
  };

  const filteredPendientes = checkInsPendientes.filter(
    (checkIn) =>
      checkIn.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.vehiculo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si se está mostrando vehículos en taller, renderizar esa vista
  if (showVehiculosEnTaller) {
    return (
      <VehiculosEnTallerSection stats={stats} onClose={() => setShowVehiculosEnTaller(false)} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Check-ins Pendientes</p>
              <p className="text-3xl font-bold text-white">{checkInsPendientes.length}</p>
              <p className="text-gray-300 text-xs">Por validar</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Check-ins Validados</p>
              <p className="text-3xl font-bold text-white">{checkInsValidados.length}</p>
              <p className="text-gray-300 text-xs">Hoy</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">OTs Creadas</p>
              <p className="text-3xl font-bold text-white">{checkInsValidados.length}</p>
              <p className="text-gray-300 text-xs">Desde check-ins</p>
            </div>
            <DocumentTextIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Evidencias</p>
              <p className="text-3xl font-bold text-white">
                {checkInsPendientes.reduce((sum, c) => sum + c.evidencias, 0) +
                  checkInsValidados.reduce((sum, c) => sum + c.evidencias, 0)}
              </p>
              <p className="text-gray-300 text-xs">Fotos/archivos</p>
            </div>
            <CameraIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, placa o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Check-ins pendientes de validación */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-yellow-400" />
            Check-ins Pendientes de Validación ({filteredPendientes.length})
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {filteredPendientes.map((checkIn) => (
            <div
              key={checkIn.id}
              className="p-6 bg-secondary-700/50 rounded-lg border-l-4 border-yellow-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <UserIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{checkIn.cliente}</h4>
                    <p className="text-xs text-primary-400 font-mono mb-1">
                      📋 {checkIn.codigoSeguimiento}
                    </p>
                    <p className="text-sm text-gray-400">
                      {checkIn.vehiculo} - {checkIn.placa}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {checkIn.telefono}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {checkIn.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Técnico: {checkIn.tecnico}</p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Check-in: {checkIn.hora}
                  </p>
                </div>
              </div>

              {checkIn.observaciones && (
                <div className="mb-4 p-3 bg-secondary-600/30 rounded-lg">
                  <p className="text-xs font-medium text-gray-400 mb-1">OBSERVACIONES</p>
                  <p className="text-sm text-gray-300">{checkIn.observaciones}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div
                  className={`rounded-lg p-3 ${
                    checkIn.datosVerificados
                      ? "bg-green-500/20 border border-green-500/30"
                      : "bg-red-500/20 border border-red-500/30"
                  }`}
                >
                  <h5 className="text-xs font-medium text-gray-400 mb-1">DATOS CLIENTE</h5>
                  <p
                    className={`text-sm ${
                      checkIn.datosVerificados ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {checkIn.datosVerificados ? "✓ Verificados" : "✗ Pendientes"}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    checkIn.firmaDigital
                      ? "bg-green-500/20 border border-green-500/30"
                      : "bg-red-500/20 border border-red-500/30"
                  }`}
                >
                  <h5 className="text-xs font-medium text-gray-400 mb-1">FIRMA DIGITAL</h5>
                  <p
                    className={`text-sm ${
                      checkIn.firmaDigital ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {checkIn.firmaDigital ? "✓ Capturada" : "✗ Faltante"}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    checkIn.evidencias >= 3
                      ? "bg-green-500/20 border border-green-500/30"
                      : "bg-yellow-500/20 border border-yellow-500/30"
                  }`}
                >
                  <h5 className="text-xs font-medium text-gray-400 mb-1">EVIDENCIAS</h5>
                  <p
                    className={`text-sm ${
                      checkIn.evidencias >= 3 ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {checkIn.evidencias} foto{checkIn.evidencias !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-400 mb-1">ESTADO</h5>
                  <p className="text-sm text-blue-400 capitalize">{checkIn.estado}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => verEvidencias(checkIn)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>Ver Inspección 360°</span>
                </button>

                <button
                  onClick={() => generarReportePDF(checkIn)}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Reporte PDF</span>
                </button>

                <button
                  onClick={() => rechazarCheckIn(checkIn.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Rechazar</span>
                </button>

                <button
                  onClick={() => validarCheckIn(checkIn.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{loading ? "Validando..." : "Validar & Crear OT"}</span>
                </button>
              </div>
            </div>
          ))}

          {filteredPendientes.length === 0 && (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm ? "No se encontraron resultados" : "No hay check-ins pendientes"}
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? "Intente con otros términos de búsqueda"
                  : "Todos los check-ins han sido procesados"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Check-ins validados recientes */}
      {checkInsValidados.length > 0 && (
        <div className="bg-secondary-800 rounded-xl border border-secondary-700">
          <div className="p-6 border-b border-secondary-700">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-400" />
              Check-ins Validados Hoy ({checkInsValidados.length})
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {checkInsValidados.map((checkIn) => (
              <div
                key={checkIn.id}
                className="p-4 bg-green-500/10 rounded-lg border-l-4 border-green-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{checkIn.cliente}</h4>
                      <p className="text-xs text-primary-400 font-mono mb-1">
                        📋 {checkIn.codigoSeguimiento}
                      </p>
                      <p className="text-sm text-gray-400">
                        {checkIn.vehiculo} - {checkIn.placa}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => generarReportePDF(checkIn)}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1 text-sm"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    <div className="text-right">
                      <p className="text-sm text-green-400">✓ OT Creada</p>
                      <p className="text-xs text-gray-400">{checkIn.hora}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Herramientas de recepción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos Cliente/Vehículo */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Datos Cliente/Vehículo</h3>
          </div>
          <p className="text-gray-400 mb-4">Validación y confirmación de información</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Verificación de datos personales</li>
            <li>• Confirmación de vehículo</li>
            <li>• Actualización de información</li>
          </ul>
        </div>

        {/* Documentación Digital */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Documentación Digital</h3>
          </div>
          <p className="text-gray-400 mb-4">Sistema de documentación y seguimiento</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Códigos de seguimiento únicos</li>
            <li>• Reportes PDF automáticos</li>
            <li>• Historial completo del vehículo</li>
            <li>• Trazabilidad del servicio</li>
          </ul>
        </div>

        {/* Visor de Fotos + Checklist */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <CameraIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Inspección Visual del Vehículo</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Documentación fotográfica 360° del estado del vehículo
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Fotos de daños preexistentes</li>
            <li>• Inspección de golpes y rayones</li>
            <li>• Estado de carrocería completa</li>
            <li>• Documentación para protección legal</li>
          </ul>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gradient-to-r from-primary-900/50 to-secondary-800 rounded-xl p-6 border border-primary-500/30">
        <h3 className="text-xl font-semibold text-white mb-4">🚀 Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={crearOTManual}
            className="flex items-center space-x-3 p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Crear OT Manual</span>
          </button>

          <button
            onClick={() => setShowVehiculosEnTaller(true)}
            className="flex items-center space-x-3 p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
          >
            <TruckIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Vehículos en Taller</span>
          </button>
        </div>
      </div>

      {/* Modal de evidencias */}
      {showEvidencias && selectedCheckIn && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Inspección Visual - {selectedCheckIn.cliente}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedCheckIn.vehiculo} - {selectedCheckIn.placa} | Técnico:{" "}
                  {selectedCheckIn.tecnico}
                </p>
              </div>
              <button
                onClick={() => setShowEvidencias(false)}
                className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Info sobre la inspección */}
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2">
                  📋 Propósito de la Inspección Visual
                </h4>
                <p className="text-sm text-gray-300">
                  Documentación fotográfica completa del estado del vehículo al momento de la
                  recepción. Estas fotos protegen tanto al taller como al cliente, registrando
                  cualquier daño preexistente como golpes, rayones, abolladuras o desgaste antes de
                  iniciar el trabajo.
                </p>
              </div>

              {/* Botón para agregar nueva foto */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowAgregarFoto(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>Agregar Nueva Foto</span>
                </button>
              </div>

              {/* Galería de fotos reales con observaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCheckIn.fotosInspeccion.map((foto) => (
                  <div key={foto.id} className="group">
                    <div
                      className={`relative bg-secondary-700 rounded-lg border-2 transition-colors ${
                        foto.tieneDano
                          ? "border-red-500/50 hover:border-red-500"
                          : "border-secondary-600 hover:border-green-500"
                      }`}
                    >
                      {/* Header de la foto */}
                      <div className="p-3 border-b border-secondary-600">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white text-sm">{foto.nombre}</h4>
                          <div className="flex items-center space-x-2">
                            {foto.tieneDano && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                ⚠️ Daño
                              </span>
                            )}
                            <button
                              onClick={() => eliminarFoto(foto.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                              title="Eliminar foto"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{foto.ubicacion}</p>
                      </div>

                      {/* Área de la imagen */}
                      <div
                        className="aspect-video bg-secondary-800 flex items-center justify-center p-4 relative overflow-hidden cursor-pointer hover:bg-secondary-700 transition-colors"
                        onClick={() => foto.url && setSelectedFoto(foto)}
                      >
                        {foto.url ? (
                          // Mostrar imagen real capturada
                          <div className="w-full h-full relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={foto.url}
                              alt={`Foto de ${foto.ubicacion}`}
                              className="w-full h-full object-cover rounded"
                            />
                            {/* Overlay con información */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-sm text-white font-medium">{foto.ubicacion}</p>
                              <p className="text-xs text-gray-300">
                                {foto.timestamp} - {foto.tecnico}
                              </p>
                            </div>
                            {/* Indicador de click */}
                            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                              <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          // Placeholder cuando no hay imagen
                          <div className="text-center">
                            <CameraIcon
                              className={`h-12 w-12 mx-auto mb-2 transition-colors ${
                                foto.tieneDano ? "text-red-400" : "text-green-400"
                              }`}
                            />
                            <p className="text-sm text-gray-400">Foto de {foto.ubicacion}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {foto.timestamp} - {foto.tecnico}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Observación */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-400 mb-1">OBSERVACIÓN:</p>
                        <p
                          className={`text-sm ${foto.tieneDano ? "text-red-300" : "text-gray-300"}`}
                        >
                          {foto.observacion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mensaje si no hay fotos */}
                {selectedCheckIn.fotosInspeccion.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No hay fotos de inspección
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Agregue fotos de las diferentes partes del vehículo para documentar su estado
                    </p>
                    <button
                      onClick={() => setShowAgregarFoto(true)}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <CameraIcon className="h-4 w-4" />
                      <span>Tomar Primera Foto</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Resumen de la inspección */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {(() => {
                  const { tieneDanos, tiposDanos } = detectarDanos(selectedCheckIn);

                  return (
                    <>
                      <div className="bg-secondary-700/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {tieneDanos ? (
                            <ExclamationCircleIcon className="h-4 w-4 text-yellow-400 mr-2" />
                          ) : (
                            <ShieldCheckIcon className="h-4 w-4 text-green-400 mr-2" />
                          )}
                          <h5 className="text-sm font-medium text-gray-300">Estado General</h5>
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            tieneDanos ? "text-yellow-400" : "text-green-400"
                          }`}
                        >
                          {tieneDanos ? "Con Daños" : "Excelente"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tieneDanos
                            ? `${tiposDanos.length} daño(s) detectado(s)`
                            : "Sin daños detectados"}
                        </p>
                      </div>

                      <div className="bg-secondary-700/50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Cobertura</h5>
                        <p className="text-lg font-bold text-white">
                          {selectedCheckIn.fotosInspeccion.length}
                        </p>
                        <p className="text-xs text-gray-400">Fotos de inspección</p>
                      </div>

                      <div className="bg-secondary-700/50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Validación</h5>
                        <p
                          className={`text-lg font-bold ${
                            selectedCheckIn.fotosInspeccion.length >= 4
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {selectedCheckIn.fotosInspeccion.length >= 4 ? "Completa" : "Pendiente"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedCheckIn.fotosInspeccion.length >= 4
                            ? "Lista para OT"
                            : `Faltan ${4 - selectedCheckIn.fotosInspeccion.length} fotos`}
                        </p>
                      </div>

                      <div className="bg-secondary-700/50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Protección Legal</h5>
                        <p className="text-lg font-bold text-blue-400">Activa</p>
                        <p className="text-xs text-gray-400">
                          {tieneDanos ? "Daños documentados" : "Cliente protegido"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Lista de daños detectados */}
              {(() => {
                const { tieneDanos, tiposDanos } = detectarDanos(selectedCheckIn);

                if (tieneDanos && tiposDanos.length > 0) {
                  return (
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <h5 className="text-sm font-medium text-yellow-400 mb-3 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                        Daños Preexistentes Detectados
                      </h5>
                      <ul className="space-y-2">
                        {tiposDanos.map((dano, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                            {dano}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-yellow-300 mt-3 font-medium">
                        ℹ️ Estos daños fueron documentados antes del inicio del trabajo para
                        protección de ambas partes.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h5 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Vehículo en Excelente Estado
                    </h5>
                    <p className="text-sm text-gray-300">
                      No se detectaron daños preexistentes en la inspección visual completa. El
                      vehículo se encuentra en excelente condición para el trabajo solicitado.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar nueva foto */}
      {showAgregarFoto && selectedCheckIn && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-secondary-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">📸 Agregar Nueva Foto</h3>
              <button
                onClick={() => setShowAgregarFoto(false)}
                className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedCheckIn.vehiculo} - {selectedCheckIn.placa}
                </p>
              </div>

              {/* Ubicación/Parte del vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ubicación/Parte del Vehículo *
                </label>
                <input
                  type="text"
                  placeholder="ej: Puerta derecha, Capó, Parachoques trasero..."
                  value={nuevaFoto.ubicacion}
                  onChange={(e) => setNuevaFoto((prev) => ({ ...prev, ubicacion: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observación/Descripción
                </label>
                <textarea
                  placeholder="ej: Rayón profundo de 15cm, Golpe menor, Estado excelente..."
                  value={nuevaFoto.observacion}
                  onChange={(e) =>
                    setNuevaFoto((prev) => ({ ...prev, observacion: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* ¿Tiene daño? */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevaFoto.tieneDano}
                    onChange={(e) =>
                      setNuevaFoto((prev) => ({ ...prev, tieneDano: e.target.checked }))
                    }
                    className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">
                    ⚠️ Esta foto documenta un daño o problema (rayón, golpe, desgaste, etc.)
                  </span>
                </label>
              </div>

              {nuevaFoto.tieneDano && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    💡 Tip: Sea específico en la observación para protección legal (ej: &quot;Rayón
                    vertical de 8cm en puerta conductor&quot;)
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-secondary-700 flex space-x-3">
              <button
                onClick={() => setShowAgregarFoto(false)}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={abrirCamara}
                disabled={loading || !nuevaFoto.ubicacion.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CameraIcon className="h-4 w-4" />
                <span>{loading ? "Guardando..." : "Tomar Foto"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Completa de Foto */}
      {selectedFoto && selectedFoto.url && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 rounded-t-lg">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedFoto.nombre}</h3>
                <p className="text-sm text-gray-300">{selectedFoto.ubicacion}</p>
              </div>
              <button
                onClick={() => setSelectedFoto(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Imagen */}
            <div className="bg-black rounded-b-lg flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedFoto.url}
                alt={`Foto completa de ${selectedFoto.ubicacion}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Footer con información */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Técnico:</span> {selectedFoto.tecnico}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Hora:</span> {selectedFoto.timestamp}
                  </p>
                </div>
                <div className="text-right">
                  {selectedFoto.tieneDano && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30">
                      ⚠️ Daño Detectado
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Observación:</span> {selectedFoto.observacion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear OT Manual */}
      {showCrearOTModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-xl border border-secondary-700 w-full max-w-4xl max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="p-6 border-b border-secondary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Crear Orden de Trabajo Manual
                  </h3>
                  <p className="text-gray-400 mt-1">Para clientes sin cita previa</p>
                </div>
                <button
                  onClick={() => setShowCrearOTModal(false)}
                  className="p-2 hover:bg-secondary-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-6">
              {/* Información del Cliente */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={nuevaOT.cliente}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, cliente: e.target.value })}
                      placeholder="Ej: Juan Pérez Rodríguez"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={nuevaOT.telefono}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, telefono: e.target.value })}
                      placeholder="Ej: +506 8888-9999"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={nuevaOT.email}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, email: e.target.value })}
                      placeholder="Ej: cliente@email.com"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Información del Vehículo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Marca *</label>
                    <input
                      type="text"
                      value={nuevaOT.marca}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, marca: e.target.value })}
                      placeholder="Ej: Honda"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Modelo *</label>
                    <input
                      type="text"
                      value={nuevaOT.modelo}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, modelo: e.target.value })}
                      placeholder="Ej: Civic"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Año *</label>
                    <input
                      type="number"
                      value={nuevaOT.año}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, año: e.target.value })}
                      placeholder="Ej: 2020"
                      min="1980"
                      max="2025"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Placa *</label>
                    <input
                      type="text"
                      value={nuevaOT.placa}
                      onChange={(e) =>
                        setNuevaOT({ ...nuevaOT, placa: e.target.value.toUpperCase() })
                      }
                      placeholder="Ej: P123ABC"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
                    <input
                      type="text"
                      value={nuevaOT.color}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, color: e.target.value })}
                      placeholder="Ej: Blanco"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Kilometraje
                    </label>
                    <input
                      type="number"
                      value={nuevaOT.kilometraje}
                      onChange={(e) => setNuevaOT({ ...nuevaOT, kilometraje: e.target.value })}
                      placeholder="Ej: 50000"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Prioridad del Trabajo</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "baja", label: "Baja", color: "gray" },
                    { value: "media", label: "Media", color: "blue" },
                    { value: "alta", label: "Alta", color: "orange" },
                    { value: "urgente", label: "Urgente", color: "red" },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setNuevaOT({ ...nuevaOT, prioridad: value as any })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        nuevaOT.prioridad === value
                          ? `bg-${color}-500/20 border-${color}-500 text-${color}-400`
                          : "bg-secondary-700/50 border-secondary-600 text-gray-300 hover:border-secondary-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Observaciones y Problema Reportado
                </h4>
                <textarea
                  rows={4}
                  value={nuevaOT.observaciones}
                  onChange={(e) => setNuevaOT({ ...nuevaOT, observaciones: e.target.value })}
                  placeholder="Describa el problema reportado por el cliente, síntomas, ruidos, etc."
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary-700 flex space-x-3">
              <button
                onClick={() => setShowCrearOTModal(false)}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={procesarOTManual}
                disabled={
                  loading ||
                  !nuevaOT.cliente.trim() ||
                  !nuevaOT.marca.trim() ||
                  !nuevaOT.modelo.trim() ||
                  !nuevaOT.placa.trim()
                }
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando OT...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Crear Orden de Trabajo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Cámara */}
      <CameraComponent
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        title={`Foto: ${nuevaFoto.ubicacion}`}
      />
    </div>
  );
}
