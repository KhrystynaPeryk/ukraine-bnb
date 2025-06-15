'use client'

import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import { getAuth } from "firebase/auth";
import EmptyState from "../components/EmptyState";
import TripsClient from "./TripsClient";
import Loader from "../components/Loader";
import { ReservationWithListing } from "./TripsClient";

const TripsPage = () => {
    const { currentUser, loading: userLoading } = useCurrentUser();
    const [reservations, setReservations] = useState<ReservationWithListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const auth = getAuth();
            const firebaseUser = auth.currentUser;
            
            if (!firebaseUser) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            setLoading(true); // Add loading state when refetching

            const response = await fetch(`/api/reservations?userId=${currentUser.id}`, {
                headers: {
                    'x-firebase-uid': firebaseUser.uid
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReservations(data);
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch reservations');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            fetchReservations();
        }
    }, [currentUser, userLoading]);

    if (userLoading || loading) {
        return <Loader />;
    }

    if (!currentUser) {
        return (
            <EmptyState title="Unauthorized" subtitle="Please login" />
        );
    }

    if (error) {
        return (
            <EmptyState title="Error" subtitle={error} />
        );
    }

    if (reservations.length === 0) {
        return (
            <EmptyState title="No trips found" subtitle="Looks like you haven't reserved any trips" />
        );
    }

    return (
        <TripsClient 
            reservations={reservations} 
            onReservationChange={fetchReservations}
        />
    );
};

export default TripsPage;