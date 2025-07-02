import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, ThumbsUp, Clock, DollarSign, User, MapPin } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  userType: 'customer' | 'worker';
}

const ratingCategories = {
  customer: [
    { key: 'serviceQuality', label: 'Kualitas Layanan', icon: ThumbsUp },
    { key: 'workerProfessionalism', label: 'Profesionalisme Pekerja', icon: User },
    { key: 'punctuality', label: 'Ketepatan Waktu', icon: Clock },
    { key: 'valueForMoney', label: 'Value for Money', icon: DollarSign }
  ],
  worker: [
    { key: 'customerCooperation', label: 'Kerja Sama Pelanggan', icon: User },
    { key: 'locationAccess', label: 'Akses Lokasi', icon: MapPin },
    { key: 'paymentPromptness', label: 'Kecepatan Pembayaran', icon: DollarSign },
    { key: 'communication', label: 'Komunikasi', icon: ThumbsUp }
  ]
};

const customerTags = [
  'Ramah', 'Tepat Waktu', 'Lokasi Mudah', 'Pembayaran Lancar', 
  'Komunikatif', 'Area Bersih', 'Instruksi Jelas'
];

const workerTags = [
  'Profesional', 'Cepat', 'Rapi', 'Ramah', 'Berpengalaman', 
  'Peralatan Lengkap', 'Hasil Memuaskan'
];

export default function RatingModal({ isOpen, onClose, order, userType }: RatingModalProps) {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = ratingCategories[userType];
  const availableTags = userType === 'customer' ? workerTags : customerTags;

  const submitRatingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/orders/${order.id}/rating`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Rating berhasil dikirim" });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal mengirim rating", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleStarClick = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleOverallRating = (rating: number) => {
    setOverallRating(rating);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast({ 
        title: "Harap berikan rating", 
        variant: "destructive"
      });
      return;
    }

    const ratingData = {
      userType,
      overallRating,
      categoryRatings: ratings,
      review,
      tags: selectedTags
    };

    submitRatingMutation.mutate(ratingData);
  };

  const StarRating = ({ rating, onRatingChange, size = 20 }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`cursor-pointer transition-colors ${
            star <= rating 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {userType === 'customer' ? 'Beri Rating untuk Pekerja' : 'Beri Rating untuk Pelanggan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detail Pesanan</h3>
            <p className="text-sm text-gray-600">ID: {order.trackingId}</p>
            <p className="text-sm text-gray-600">Layanan: {order.serviceName}</p>
            <p className="text-sm text-gray-600">
              Tanggal: {new Date(order.scheduledTime).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <Label className="text-base font-medium">Rating Keseluruhan</Label>
            <div className="mt-2 flex items-center gap-4">
              <StarRating 
                rating={overallRating} 
                onRatingChange={handleOverallRating}
                size={32}
              />
              <span className="text-lg font-medium">{overallRating}/5</span>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <Label className="text-base font-medium">Rating Detail</Label>
            <div className="mt-3 space-y-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <StarRating 
                      rating={ratings[category.key] || 0} 
                      onRatingChange={(rating: number) => handleStarClick(category.key, rating)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-medium">Tag Penilaian</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <Label htmlFor="review" className="text-base font-medium">
              Ulasan (Opsional)
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={
                userType === 'customer' 
                  ? "Bagikan pengalaman Anda dengan layanan ini..."
                  : "Bagikan pengalaman Anda dengan pelanggan ini..."
              }
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={submitRatingMutation.isPending || overallRating === 0}
              className="flex-1"
            >
              {submitRatingMutation.isPending ? 'Mengirim...' : 'Kirim Rating'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}